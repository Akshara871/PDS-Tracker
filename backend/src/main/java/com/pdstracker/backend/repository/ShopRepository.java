
package com.pdstracker.backend.repository;

import com.pdstracker.backend.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ShopRepository extends JpaRepository<Shop, Integer> {

    List<Shop> findByDealerId(Integer dealerId);

    Optional<Shop> findByShopIdAndDealerId(
        Integer shopId,
        Integer dealerId
    );
}
