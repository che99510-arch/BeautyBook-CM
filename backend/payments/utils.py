from decimal import Decimal, ROUND_HALF_UP

BOOKING_FEE_RATE = Decimal('0.10')  # 10%


def calculate_booking_fee(service_price):
    """Calculate platform booking fee as 10% of service price."""
    fee = Decimal(str(service_price)) * BOOKING_FEE_RATE
    return fee.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
