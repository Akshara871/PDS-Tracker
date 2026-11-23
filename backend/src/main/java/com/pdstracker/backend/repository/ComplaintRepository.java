
package com.pdstracker.backend.repository;

import com.pdstracker.backend.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Integer> {

    List<Complaint> findByUserId(Integer userId);

}
