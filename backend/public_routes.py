from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Product, Shop
from schemas import ProductOut, ShopOut

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/shops", response_model=list[ShopOut])
def list_public_shops(db: Session = Depends(get_db)):
    return db.query(Shop).order_by(Shop.id).all()


@router.get("/shops/{shop_id}/products", response_model=list[ProductOut])
def list_public_products(shop_id: int, db: Session = Depends(get_db)):
    if db.get(Shop, shop_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found")
    return db.query(Product).filter(Product.shop_id == shop_id).order_by(Product.id).all()
