select SD.INTERNAL_SHIPMENT_NUM,
       SD.ITEM,
       ILA.ALLOCATION_LOC,
       L.USER_DEF4,
       Q.NONMEZZ
from   SHIPMENT_DETAIL SD
       left join ITEM_LOCATION_ASSIGNMENT ILA
              on SD.ITEM = ILA.ITEM
                 and SD.WAREHOUSE = ILA.WAREHOUSE
       left join LOCATION L
              on ILA.ALLOCATION_LOC = L.LOCATION
                 and ILA.WAREHOUSE = L.WAREHOUSE
       left join (select SD.SHIPMENT_ID,
                         Count(*) as [NonMezz]
                  from   SHIPMENT_DETAIL SD
                         join ITEM_LOCATION_ASSIGNMENT ILA
                           on ILA.WAREHOUSE = SD.WAREHOUSE
                              and ILA.ITEM = SD.ITEM
                         join LOCATION L
                           on L.WAREHOUSE = ILA.WAREHOUSE
                              and L.LOCATION = ILA.ALLOCATION_LOC
                  where  L.USER_DEF4 <> 'Mezz'
                  group  by SD.SHIPMENT_ID) Q
              on Q.SHIPMENT_ID = SD.SHIPMENT_ID
where  SD.WAREHOUSE = 'eph'
       and ( Q.NONMEZZ is null
              or Q.NONMEZZ = 0 )
       and ( SD.SHIPMENT_ID like 'SO1234567%'
              or SD.SHIPMENT_ID like 'SO87654321%' ) 
