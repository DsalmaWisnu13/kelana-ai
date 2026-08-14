from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_recommended_places,
    get_transportation
)


def print_trip_summary(
    destination,
    days,
    budget,
    currency,
    category,
    daily_budget,
    transportation,
    recommended_places
):
    print("==============================")
    print("KelanaAI")
    print("==============================")

    print(f"Destination     = {destination}")
    print(f"Days            = {days}")
    print(f"Budget          = {budget} {currency}")
    print(f"Category        = {category}")
    print(f"Daily Budget    = {daily_budget} {currency}/Day")
    print(f"Recommended Transportation: {transportation}")

    print("\nRecommended Places")

    for place in recommended_places:
        print(f"- {place}")


# Input user
destination = input("Destination: ")
country = input("Country: ")
days = int(input("Days: "))
budget = float(input("Budget: "))
currency = input("Currency: ")
month_travel = input("Travel Month: ")


# Calculate trip information
daily_budget = calculate_daily_budget(budget, days)
category = get_trip_category(budget)
recommended_places = get_recommended_places(destination)
transportation = get_transportation(category)

# Display trip summary
print_trip_summary(
    destination,
    days,
    budget,
    currency,
    category,
    daily_budget,
    transportation,
    recommended_places
)