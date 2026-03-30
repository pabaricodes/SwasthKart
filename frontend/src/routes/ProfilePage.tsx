import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useUiStore } from "../store/uiStore";

interface Profile {
  id: string;
  phone_masked: string;
  name: string | null;
  role: string;
}

export function ProfilePage() {
  const { logout } = useAuth();
  const addToast = useUiStore((s) => s.addToast);
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const profileQuery = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: () => api.get<Profile>("/ui/profile"),
    onSuccess: (data: Profile) => setName(data.name || ""),
  } as any);

  const updateMutation = useMutation({
    mutationFn: (data: { name: string }) => api.put<Profile>("/ui/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      addToast("Profile updated", "success");
    },
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <p className="text-sm text-gray-600">{profileQuery.data?.phone_masked}</p>
        </div>

        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Button
          loading={updateMutation.isPending}
          onClick={() => updateMutation.mutate({ name })}
        >
          Save Changes
        </Button>
      </div>

      <Button
        variant="outline"
        className="w-full mt-6"
        loading={logout.isPending}
        onClick={() => logout.mutate()}
      >
        Logout
      </Button>
    </div>
  );
}
