
package com.pdstracker.backend.service;

import com.pdstracker.backend.dto.ShopStatusUpdateRequest;
import com.pdstracker.backend.dto.StockUpdateRequest;
import com.pdstracker.backend.entity.ActivityLog;
import com.pdstracker.backend.entity.Commodity;
import com.pdstracker.backend.entity.Shop;
import com.pdstracker.backend.entity.Stock;
import com.pdstracker.backend.entity.User;

import com.pdstracker.backend.repository.ActivityLogRepository;
import com.pdstracker.backend.repository.CommodityRepository;
import com.pdstracker.backend.repository.ShopRepository;
import com.pdstracker.backend.repository.StockRepository;
import com.pdstracker.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DealerService {

    private final ShopRepository shopRepository;
    private final CommodityRepository commodityRepository;
    private final StockRepository stockRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    public DealerService(
            ShopRepository shopRepository,
            CommodityRepository commodityRepository,
            StockRepository stockRepository,
            ActivityLogRepository activityLogRepository,
            UserRepository userRepository) {

        this.shopRepository = shopRepository;
        this.commodityRepository = commodityRepository;
        this.stockRepository = stockRepository;
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
    }

    // Get the dealer's shop
    public Shop getDealerShop(String email) {

        User dealer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Dealer not found"));

        List<Shop> shops = shopRepository.findByDealerId(dealer.getId());

        if (shops.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "No shop found for this dealer");
        }

        return shops.get(0);
    }

    // Get saved stock of the dealer's own shop
    public List<Map<String, Object>> getDealerShopStock(
            Integer shopId, String email) {

        User dealer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Dealer not found"));

        Shop shop = shopRepository
                .findByShopIdAndDealerId(shopId, dealer.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You cannot view another dealer's shop"));

        List<Stock> stocks = stockRepository.findByShopId(shop.getShopId());

        List<Map<String, Object>> result = new ArrayList<>();

        for (Stock stock : stocks) {

            Commodity commodity = commodityRepository
                    .findById(stock.getCommodityId())
                    .orElse(null);

            Map<String, Object> item = new HashMap<>();

            item.put("commodityId", stock.getCommodityId());
            item.put("commodityName",
                    commodity != null ? commodity.getCommodityName() : "Unknown");
            item.put("unit",
                    commodity != null ? commodity.getUnit() : "");
            item.put("quantity", stock.getQuantity());
            item.put("lastUpdated", stock.getLastUpdated());

            result.add(item);
        }

        return result;
    }

    @Transactional
    public Stock updateStock(
            StockUpdateRequest request,
            String email) {

        User dealer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Dealer not found"));

        Shop shop = shopRepository
                .findByShopIdAndDealerId(
                        request.getShopId(), dealer.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You cannot update another dealer's shop"));

        Commodity commodity = commodityRepository
                .findById(request.getCommodityId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Commodity not found"));

        Stock.StockId stockId = new Stock.StockId(
                shop.getShopId(),
                commodity.getCommodityId());

        Stock stock = stockRepository.findById(stockId)
                .orElseGet(Stock::new);

        stock.setShopId(shop.getShopId());
        stock.setCommodityId(commodity.getCommodityId());
        stock.setQuantity(request.getQuantity());

        Stock savedStock = stockRepository.save(stock);

        ActivityLog log = new ActivityLog();
        log.setUserId(dealer.getId());
        log.setAction("STOCK_UPDATED");
        log.setDescription(
                "Updated " + commodity.getCommodityName()
                + " stock at " + shop.getShopName()
                + ". New quantity: " + request.getQuantity()
                + " " + commodity.getUnit());

        activityLogRepository.save(log);

        return savedStock;
    }

    @Transactional
    public Shop updateShopStatus(
            ShopStatusUpdateRequest request,
            String email) {

        User dealer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Dealer not found"));

        Shop shop = shopRepository
                .findByShopIdAndDealerId(
                        request.getShopId(),
                        dealer.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You cannot update another dealer's shop"));

        shop.setStatus(request.getStatus());

        Shop savedShop = shopRepository.save(shop);

        ActivityLog log = new ActivityLog();
        log.setUserId(dealer.getId());
        log.setAction("SHOP_STATUS_UPDATED");
        log.setDescription(
                "Changed shop " + shop.getShopName()
                + " status to " + request.getStatus());

        activityLogRepository.save(log);

        return savedShop;
    }
}
