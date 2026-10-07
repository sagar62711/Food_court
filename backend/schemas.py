from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ShopCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    cuisine_type: str = Field(min_length=1, max_length=50)
    description: Optional[str] = None
    image_url: Optional[str] = None


class ShopUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    cuisine_type: Optional[str] = Field(default=None, min_length=1, max_length=50)
    description: Optional[str] = None
    image_url: Optional[str] = None


class ShopOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    cuisine_type: str
    description: Optional[str]
    image_url: Optional[str]


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    price: float = Field(ge=0)
    image_url: Optional[str] = None
    is_available: bool = True


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, ge=0)
    image_url: Optional[str] = None
    is_available: Optional[bool] = None


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    shop_id: int
    name: str
    description: Optional[str]
    price: float
    image_url: Optional[str]
    is_available: bool


class OwnerCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=72)


class OwnerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    role: str
    shop_id: Optional[int]


class OrderItemIn(BaseModel):
    product_id: int
    quantity: int = Field(ge=1, le=50)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=100)
    table_number: int = Field(ge=1)
    items: list[OrderItemIn] = Field(min_length=1, max_length=50)


class OrderCreated(BaseModel):
    order_number: str
    customer_name: str
    table_number: int
    total: float


class OwnerOrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    order_number: str
    customer_name: str
    table_number: int
    created_at: datetime
    product_id: int
    product_name: str
    price: float
    quantity: int
