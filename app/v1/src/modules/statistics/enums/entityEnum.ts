
export enum EntityEnum {
  DEPARTMENT = 'department',
  LOCATION = 'location',
  

}
 
export const entitiesTablesAndColumnsNames =   [
  {entity: EntityEnum.DEPARTMENT , table: 'departments' , column: 'department_id'} , 
  {entity: EntityEnum.LOCATION   , table: 'locations'  , column: 'location_id' }

]
export enum UserEntitiesEnum{
  VISA = 'visa' , 
  EMERGENCEY = 'emergency',
  EDUCATION = 'education',
  SOCIAL = 'social',
  EXTRA_INFORMATIONS = 'extra_information'
} 
export const UserEntitiesTablesConfig =   [
  {entity: UserEntitiesEnum.SOCIAL , table: 'user_social_links' , column: 'user_id'} , 
  {entity: UserEntitiesEnum.EMERGENCEY, table: 'emergency_contacts'  , column: 'id' } , 
  {entity: UserEntitiesEnum.VISA, table: 'user_visa'  , column: 'id' } ,
  {entity: UserEntitiesEnum.EXTRA_INFORMATIONS   , table: 'user_extra_information'  , column: 'user_id' } ,
  {entity: UserEntitiesEnum.SOCIAL , table: 'user_social_links' , column: 'user_id' } ,
]


