
package com.pdstracker.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class ShopStatusUpdateRequest {

    @NotNull(message = "Shop ID is required")
    private Integer shopId;

    @NotNull(message = "Shop status is required")
    @Pattern(
        regexp = "OPEN|CLOSED",
        message = "Status must be OPEN or CLOSED"
    )
    private String status;

    public Integer getShopId() {
        return shopId;
    }

    public void setShopId(Integer shopId) {
        this.shopId = shopId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
