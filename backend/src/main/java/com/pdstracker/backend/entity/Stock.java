
package com.pdstracker.backend.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock")
@IdClass(Stock.StockId.class)
public class Stock {

    @Id
    @Column(name = "shop_id")
    private Integer shopId;

    @Id
    @Column(name = "commodity_id")
    private Integer commodityId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    public Stock() {
    }

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        lastUpdated = LocalDateTime.now();
    }

    public Integer getShopId() {
        return shopId;
    }

    public void setShopId(Integer shopId) {
        this.shopId = shopId;
    }

    public Integer getCommodityId() {
        return commodityId;
    }

    public void setCommodityId(Integer commodityId) {
        this.commodityId = commodityId;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public static class StockId implements Serializable {

        private Integer shopId;
        private Integer commodityId;

        public StockId() {
        }

        public StockId(Integer shopId, Integer commodityId) {
            this.shopId = shopId;
            this.commodityId = commodityId;
        }

        public Integer getShopId() {
            return shopId;
        }

        public void setShopId(Integer shopId) {
            this.shopId = shopId;
        }

        public Integer getCommodityId() {
            return commodityId;
        }

        public void setCommodityId(Integer commodityId) {
            this.commodityId = commodityId;
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (!(obj instanceof StockId)) return false;

            StockId other = (StockId) obj;

            return java.util.Objects.equals(shopId, other.shopId)
                && java.util.Objects.equals(
                    commodityId, other.commodityId
                );
        }

        @Override
        public int hashCode() {
            return java.util.Objects.hash(shopId, commodityId);
        }
    }
}
