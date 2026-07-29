package com.smartserv.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smartserv.entity.Invoice;
import com.smartserv.entity.PaymentStatus;


public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    boolean existsByJobCardId(Long jobCardId);

    boolean existsByInvoiceNumber(String invoiceNumber);

    Invoice  findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice>  findByJobCardId(Long jobCardId);


    @Query("SELECT i FROM Invoice i WHERE i.jobCard.appointment.vehicleDetails.customer.id = :customerId")
    List<Invoice> findByCustomerId(@Param("customerId") Long customerId);

    List<Invoice> findByPaymentStatus(PaymentStatus paymentStatus);

    long countByPaymentStatus(PaymentStatus paymentStatus);
}

