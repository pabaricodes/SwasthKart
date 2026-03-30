package com.swasthkart.inventory.config;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.usertype.UserType;

import java.io.Serializable;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;

/**
 * Custom Hibernate UserType that maps Java enums to PostgreSQL custom enum types.
 * Solves: "operator does not exist: reservation_status = character varying"
 *
 * Hibernate by default sends enum values as varchar, but Postgres custom enum
 * types require the value to be sent as Types.OTHER so the JDBC driver lets
 * Postgres cast it to the correct enum type.
 */
public class PostgresEnumType implements UserType<Enum> {

    @Override
    public int getSqlType() {
        return Types.OTHER;
    }

    @Override
    @SuppressWarnings("unchecked")
    public Class<Enum> returnedClass() {
        return Enum.class;
    }

    @Override
    public boolean equals(Enum x, Enum y) {
        return x == y || (x != null && x.equals(y));
    }

    @Override
    public int hashCode(Enum x) {
        return x == null ? 0 : x.hashCode();
    }

    @Override
    @SuppressWarnings({"unchecked", "rawtypes"})
    public Enum nullSafeGet(ResultSet rs, int position,
                            SharedSessionContractImplementor session, Object owner)
            throws SQLException {
        String value = rs.getString(position);
        if (rs.wasNull() || value == null) return null;

        // Determine the actual enum class from the owner field
        // We handle this generically — works for any enum
        Class<?> enumClass = returnedClass();
        if (owner != null) {
            try {
                var field = owner.getClass().getDeclaredField("status");
                enumClass = field.getType();
            } catch (NoSuchFieldException ignored) {
                // fallback
            }
        }
        return Enum.valueOf((Class<Enum>) enumClass, value);
    }

    @Override
    public void nullSafeSet(PreparedStatement st, Enum value, int index,
                            SharedSessionContractImplementor session)
            throws SQLException {
        if (value == null) {
            st.setNull(index, Types.OTHER);
        } else {
            // Send as Types.OTHER — Postgres JDBC driver will use the column's
            // declared type instead of forcing varchar
            st.setObject(index, value.name(), Types.OTHER);
        }
    }

    @Override
    public Enum deepCopy(Enum value) {
        return value; // enums are immutable
    }

    @Override
    public boolean isMutable() {
        return false;
    }

    @Override
    public Serializable disassemble(Enum value) {
        return value;
    }

    @Override
    @SuppressWarnings("unchecked")
    public Enum assemble(Serializable cached, Object owner) {
        return (Enum) cached;
    }
}
