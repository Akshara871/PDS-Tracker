
package com.pdstracker.backend.repository;

import com.pdstracker.backend.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityLogRepository
        extends JpaRepository<ActivityLog, Integer> {

    List<ActivityLog> findByUserIdOrderByActivityTimestampDesc(
        Integer userId
    );
}
