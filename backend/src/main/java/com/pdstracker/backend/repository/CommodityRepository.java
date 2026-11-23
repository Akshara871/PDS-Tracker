
package com.pdstracker.backend.repository;

import com.pdstracker.backend.entity.Commodity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommodityRepository
        extends JpaRepository<Commodity, Integer> {
}
