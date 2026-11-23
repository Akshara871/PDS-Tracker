
package com.pdstracker.backend.controller;

import com.pdstracker.backend.entity.User;
import com.pdstracker.backend.entity.Shop;
import com.pdstracker.backend.entity.Stock;
import com.pdstracker.backend.entity.Commodity;
import com.pdstracker.backend.entity.ActivityLog;

import com.pdstracker.backend.repository.UserRepository;
import com.pdstracker.backend.repository.ShopRepository;
import com.pdstracker.backend.repository.StockRepository;
import com.pdstracker.backend.repository.CommodityRepository;
import com.pdstracker.backend.repository.ActivityLogRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.LinkedHashMap;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final StockRepository stockRepository;
    private final CommodityRepository commodityRepository;
    private final ActivityLogRepository activityLogRepository;

    public AdminController(
            UserRepository userRepository,
            ShopRepository shopRepository,
            StockRepository stockRepository,
            CommodityRepository commodityRepository,
            ActivityLogRepository activityLogRepository) {

        this.userRepository = userRepository;
        this.shopRepository = shopRepository;
        this.stockRepository = stockRepository;
        this.commodityRepository = commodityRepository;
        this.activityLogRepository = activityLogRepository;
    }

    // View all registered users
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // View all ration shops
    @GetMapping("/shops")
    public List<Shop> getAllShops() {
        return shopRepository.findAll();
    }

    // View stock of all shops
    @GetMapping("/stock")
    public List<Map<String, Object>> getAllStock() {

        List<Stock> stocks = stockRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Stock stock : stocks) {

            Shop shop = shopRepository
                    .findById(stock.getShopId())
                    .orElse(null);

            Commodity commodity = commodityRepository
                    .findById(stock.getCommodityId())
                    .orElse(null);

            if (shop != null && commodity != null) {

                Map<String, Object> item = new LinkedHashMap<>();

                item.put("shopId", shop.getShopId());
                item.put("shopName", shop.getShopName());
                item.put("commodityName", commodity.getCommodityName());
                item.put("quantity", stock.getQuantity());
                item.put("unit", commodity.getUnit());
                item.put("lastUpdated", stock.getLastUpdated());

                result.add(item);
            }
        }

        return result;
    }

    // View all user activity logs
    @GetMapping("/logs")
    public List<Map<String, Object>> getAllActivityLogs() {

        List<ActivityLog> logs = activityLogRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (ActivityLog log : logs) {

            User user = userRepository
                    .findById(log.getUserId())
                    .orElse(null);

            Map<String, Object> item = new LinkedHashMap<>();

            item.put("logId", log.getLogId());
            item.put("userId", log.getUserId());
            item.put("userName", user != null ? user.getName() : "Unknown");
            item.put("action", log.getAction());
            item.put("description", log.getDescription());
            item.put("activityTimestamp", log.getActivityTimestamp());

            result.add(item);
        }

        return result;
    }
}
