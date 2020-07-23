select SD.internal_shipment_num, SD.item, ILA.allocation_loc, L.user_def4, Q.nonmezz from shipment_detail SD left 
join item_location_assignment ILA on SD.item = ILA.item and SD.warehouse = ILA.warehouse left join location L on ILA
.allocation_loc = L.location and ILA.warehouse = L.warehouse left join (select SD.shipment_id, Count(*) as [NonMezz] 
 from shipment_detail SD join item_location_assignment ILA on ILA.warehouse = SD.warehouse and ILA.item = SD.item 
join location L on L.warehouse = ILA.warehouse and L.location = ILA.allocation_loc where L.user_def4 <> 'Mezz' group
 by SD.shipment_id) Q on Q.shipment_id = SD.shipment_id where SD.warehouse = 'eph' and ( Q.nonmezz is null or Q.nonmezz
 = 0 ) and ( SD.shipment_id like 'SO1234567%' or SD.shipment_id like 'SO87654321%' ) 