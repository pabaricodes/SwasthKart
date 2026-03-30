package com.swasthkart.inventory.api;

import com.swasthkart.inventory.dto.AdminCreateInventoryRequest;
import com.swasthkart.inventory.dto.AdminInventoryResponse;
import com.swasthkart.inventory.dto.AdminUpdateInventoryRequest;
import com.swasthkart.inventory.dto.ErrorResponse;
import com.swasthkart.inventory.service.AdminInventoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/admin/inventory")
public class AdminInventoryController {

    private final AdminInventoryService adminInventoryService;

    public AdminInventoryController(AdminInventoryService adminInventoryService) {
        this.adminInventoryService = adminInventoryService;
    }

    @GetMapping
    public Page<AdminInventoryResponse> listAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return adminInventoryService.listAll(page, size);
    }

    @PutMapping("/{sku}")
    public AdminInventoryResponse updateStock(
            @PathVariable String sku,
            @Valid @RequestBody AdminUpdateInventoryRequest request) {
        return adminInventoryService.updateStock(sku, request);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminInventoryResponse create(@Valid @RequestBody AdminCreateInventoryRequest request) {
        return adminInventoryService.create(request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(IllegalArgumentException ex) {
        ErrorResponse error = ErrorResponse.of("INVENTORY_ERROR", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
