package com.swasthkart.inventory.api;

import com.swasthkart.inventory.dto.ReserveRequest;
import com.swasthkart.inventory.dto.ReserveResponse;
import com.swasthkart.inventory.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/inventory")
public class ReservationController {

  private final ReservationService reservationService;

  @PostMapping("/reservations")
  @ResponseStatus(HttpStatus.CREATED)
  public ReserveResponse reserve(@Valid @RequestBody ReserveRequest req) {
    return reservationService.reserve(req);
  }

  @DeleteMapping("/reservations/{reservationId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void cancel(@PathVariable UUID reservationId) {
    reservationService.cancel(reservationId);
  }
}