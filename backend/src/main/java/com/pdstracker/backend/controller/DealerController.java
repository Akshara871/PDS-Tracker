
package com.pdstracker.backend.controller;

import com.pdstracker.backend.dto.ShopStatusUpdateRequest;
import com.pdstracker.backend.dto.StockUpdateRequest;
import com.pdstracker.backend.entity.Shop;
import com.pdstracker.backend.entity.Stock;
import com.pdstracker.backend.service.DealerService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dealer")
public class DealerController {

    private final DealerService dealerService;

    public DealerController(DealerService dealerService) {
        this.dealerService = dealerService;
    }

    // Get dealer's shop information
    @GetMapping("/shop")
    public ResponseEntity<Shop> getDealerShop(
            Authentication authentication) {

        Shop shop = dealerService.getDealerShop(
                authentication.getName());

        return ResponseEntity.ok(shop);
    }

    // Get saved stock of a particular shop
    @GetMapping("/shop/{shopId}/stock")
    public ResponseEntity<List<Map<String, Object>>> getDealerShopStock(
            @PathVariable Integer shopId,
            Authentication authentication) {

        List<Map<String, Object>> stock =
                dealerService.getDealerShopStock(
                        shopId, authentication.getName());

        return ResponseEntity.ok(stock);
    }

    // Update commodity stock
    @PostMapping("/stock")
    public ResponseEntity<Map<String, Object>> updateStock(
            @Valid @RequestBody StockUpdateRequest request,
            Authentication authentication) {

        Stock stock = dealerService.updateStock(
                request,
                authentication.getName()
        );

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Stock updated successfully");
        response.put("shopId", stock.getShopId());
        response.put("commodityId", stock.getCommodityId());
        response.put("quantity", stock.getQuantity());
        response.put("lastUpdated", stock.getLastUpdated());

        return ResponseEntity.ok(response);
    }

    // Update shop status
    @PutMapping("/shop/status")
    public ResponseEntity<Map<String, Object>> updateShopStatus(
            @Valid @RequestBody ShopStatusUpdateRequest request,
            Authentication authentication) {

        Shop shop = dealerService.updateShopStatus(
                request,
                authentication.getName()
        );

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Shop status updated successfully");
        response.put("shopId", shop.getShopId());
        response.put("shopName", shop.getShopName());
        response.put("status", shop.getStatus());

        return ResponseEntity.ok(response);
    }
}
