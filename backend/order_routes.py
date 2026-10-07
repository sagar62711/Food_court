import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import require_shop_owner
from database import get_db
from models import Order, OrderItem, Product, User
from schemas import OrderCreate, OrderCreated, OwnerOrderItemOut

public_router = APIRouter(prefix="/api", tags=["orders"])
owner_router = APIRouter(
    prefix="/api/owner",
    tags=["shop owner"],
    dependencies=[Depends(require_shop_owner)],
)


@public_router.post("/orders", response_model=OrderCreated, status_code=status.HTTP_201_CREATED)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    product_ids = {item.product_id for item in data.items}
    products = {p.id: p for p in db.query(Product).filter(Product.id.in_(product_ids)).all()}

    bad_ids = sorted(pid for pid in product_ids if pid not in products or not products[pid].is_available)
    if bad_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"These products are missing or unavailable: {bad_ids}",
        )

    order = Order(
        order_number=f"FC-{uuid.uuid4().hex[:8].upper()}",
        customer_name=data.customer_name,
        table_number=data.table_number,
    )
    for item in data.items:
        product = products[item.product_id]
        order.items.append(
            OrderItem(
                shop_id=product.shop_id,
                product_id=product.id,
                product_name=product.name,
                price=product.price,
                quantity=item.quantity,
            )
        )

    db.add(order)
    db.commit()
    db.refresh(order)

    total = sum(item.price * item.quantity for item in order.items)
    return OrderCreated(
        order_number=order.order_number,
        customer_name=order.customer_name,
        table_number=order.table_number,
        total=total,
    )


@owner_router.get("/orders", response_model=list[OwnerOrderItemOut])
def list_owner_orders(owner: User = Depends(require_shop_owner), db: Session = Depends(get_db)):
    rows = (
        db.query(OrderItem, Order)
        .join(Order, OrderItem.order_id == Order.id)
        .filter(OrderItem.shop_id == owner.shop_id)
        .order_by(Order.created_at.desc(), OrderItem.id)
        .all()
    )
    return [
        OwnerOrderItemOut(
            order_number=order.order_number,
            customer_name=order.customer_name,
            table_number=order.table_number,
            created_at=order.created_at,
            product_id=item.product_id,
            product_name=item.product_name,
            price=item.price,
            quantity=item.quantity,
        )
        for item, order in rows
    ]
