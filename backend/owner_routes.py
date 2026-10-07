from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import require_shop_owner
from database import get_db
from models import Product, User
from schemas import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(
    prefix="/api/owner/products",
    tags=["shop owner"],
    dependencies=[Depends(require_shop_owner)],
)


def get_own_product_or_404(product_id: int, owner: User, db: Session) -> Product:
    product = db.get(Product, product_id)
    # Same 404 whether the product is missing or belongs to another shop,
    # so an owner can't use this endpoint to discover other shops' product ids.
    if product is None or product.shop_id != owner.shop_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    data: ProductCreate,
    owner: User = Depends(require_shop_owner),
    db: Session = Depends(get_db),
):
    product = Product(**data.model_dump(), shop_id=owner.shop_id)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("", response_model=list[ProductOut])
def list_products(owner: User = Depends(require_shop_owner), db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.shop_id == owner.shop_id).order_by(Product.id).all()


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    data: ProductUpdate,
    owner: User = Depends(require_shop_owner),
    db: Session = Depends(get_db),
):
    product = get_own_product_or_404(product_id, owner, db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    owner: User = Depends(require_shop_owner),
    db: Session = Depends(get_db),
):
    product = get_own_product_or_404(product_id, owner, db)
    db.delete(product)
    db.commit()


@router.post("/{product_id}/toggle-availability", response_model=ProductOut)
def toggle_availability(
    product_id: int,
    owner: User = Depends(require_shop_owner),
    db: Session = Depends(get_db),
):
    product = get_own_product_or_404(product_id, owner, db)
    product.is_available = not product.is_available
    db.commit()
    db.refresh(product)
    return product
