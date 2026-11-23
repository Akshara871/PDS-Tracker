package com.pdstracker.backend.controller;

import com.pdstracker.backend.entity.Shop;
import com.pdstracker.backend.entity.Stock;
import com.pdstracker.backend.entity.Commodity;

import com.pdstracker.backend.repository.ShopRepository;
import com.pdstracker.backend.repository.StockRepository;
import com.pdstracker.backend.repository.CommodityRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/beneficiary")
public class BeneficiaryController {

    private final ShopRepository shopRepository;
    private final StockRepository stockRepository;
    private final CommodityRepository commodityRepository;

    public BeneficiaryController(
            ShopRepository shopRepository,
            StockRepository stockRepository,
            CommodityRepository commodityRepository) {

        this.shopRepository = shopRepository;
        this.stockRepository = stockRepository;
        this.commodityRepository = commodityRepository;
    }

    // View all ration shops
    @GetMapping("/shops")
    public List<Shop> getAllShops() {
        return shopRepository.findAll();
    }

    // View stock of a particular ration shop
    @GetMapping("/shops/{shopId}/stock")
    public List<Map<String, Object>> getShopStock(
            @PathVariable Integer shopId) {

        shopRepository.findById(shopId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Shop not found"));

        List<Stock> stocks = stockRepository.findByShopId(shopId);

        List<Map<String, Object>> result = new ArrayList<>();

        for (Stock stock : stocks) {

            Commodity commodity = commodityRepository
                    .findById(stock.getCommodityId())
                    .orElse(null);

            if (commodity != null) {

                Map<String, Object> item = new LinkedHashMap<>();

                item.put("commodityId", commodity.getCommodityId());
                item.put("commodityName", commodity.getCommodityName());
                item.put("quantity", stock.getQuantity());
                item.put("unit", commodity.getUnit());
                item.put("lastUpdated", stock.getLastUpdated());

                result.add(item);
            }
        }

        return result;
    }
}