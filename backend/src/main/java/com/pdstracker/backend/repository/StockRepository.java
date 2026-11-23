
package com.pdstracker.backend.repository;

import com.pdstracker.backend.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockRepository
        extends JpaRepository<Stock, Stock.StockId> {

    List<Stock> findByShopId(Integer shopId);

    List<Stock> findByCommodityId(Integer commodityId);
}

