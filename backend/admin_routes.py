from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import hash_password, require_admin
from database import get_db
from models import Shop, User
from schemas import OwnerCreate, OwnerOut, ShopCreate, ShopOut, ShopUpdate

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin)],
)


def get_shop_or_404(shop_id: int, db: Session) -> Shop:
    shop = db.get(Shop, shop_id)
    if shop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found")
    return shop


@router.post("/shops", response_model=ShopOut, status_code=status.HTTP_201_CREATED)
def create_shop(data: ShopCreate, db: Session = Depends(get_db)):
    shop = Shop(**data.model_dump())
    db.add(shop)
    db.commit()
    db.refresh(shop)
    return shop


@router.get("/shops", response_model=list[ShopOut])
def list_shops(db: Session = Depends(get_db)):
    return db.query(Shop).order_by(Shop.id).all()


@router.put("/shops/{shop_id}", response_model=ShopOut)
def update_shop(shop_id: int, data: ShopUpdate, db: Session = Depends(get_db)):
    shop = get_shop_or_404(shop_id, db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(shop, field, value)
    db.commit()
    db.refresh(shop)
    return shop


@router.delete("/shops/{shop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shop(shop_id: int, db: Session = Depends(get_db)):
    shop = get_shop_or_404(shop_id, db)
    db.delete(shop)  # cascade also deletes the shop's products and owner accounts
    db.commit()


@router.post(
    "/shops/{shop_id}/owner",
    response_model=OwnerOut,
    status_code=status.HTTP_201_CREATED,
)
def create_shop_owner(shop_id: int, data: OwnerCreate, db: Session = Depends(get_db)):
    shop = get_shop_or_404(shop_id, db)

    if db.query(User).filter(User.shop_id == shop.id).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This shop already has an owner")
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    owner = User(
        username=data.username,
        hashed_password=hash_password(data.password),
        role="shop_owner",
        shop_id=shop.id,
    )
    db.add(owner)
    db.commit()
    db.refresh(owner)
    return owner
