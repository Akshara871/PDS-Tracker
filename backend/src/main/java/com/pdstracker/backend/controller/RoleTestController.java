
package com.pdstracker.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class RoleTestController {

    @GetMapping("/admin/test")
    public Map<String, String> adminTest() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Admin access successful");
        response.put("role", "ADMIN");
        return response;
    }

    @GetMapping("/dealer/test")
    public Map<String, String> dealerTest() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Dealer access successful");
        response.put("role", "SHOP_DEALER");
        return response;
    }

    @GetMapping("/beneficiary/test")
    public Map<String, String> beneficiaryTest() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Beneficiary access successful");
        response.put("role", "BENEFICIARY");
        return response;
    }
}
