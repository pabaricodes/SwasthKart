package com.swasthkart.inventory.api;

import com.swasthkart.inventory.dto.ReserveRequest;
import com.swasthkart.inventory.dto.ReserveResponse;
import com.swasthkart.inventory.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping("/reservations")
    @ResponseStatus(HttpStatus.CREATED)
    public ReserveResponse reserve(@Valid @RequestBody ReserveRequest req) {
        return reservationService.reserve(req);
    }

    @PostMapping("/reservations/{reservationId}/confirm")
    public Map<String, String> confirm(@PathVariable UUID reservationId) {
        String status = reservationService.confirm(reservationId);
        return Map.of("status", status);
    }

    @PostMapping("/reservations/{reservationId}/release")
    public Map<String, String> release(@PathVariable UUID reservationId) {
        String status = reservationService.release(reservationId);
        return Map.of("status", status);
    }
}
