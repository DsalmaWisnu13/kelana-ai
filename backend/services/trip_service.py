def calculate_daily_budget(budget, days):
    return budget / days


def get_trip_category(budget):
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"

def get_transportation(category):
    if category == "Backpacker":
        return "Bus"
    elif category == "Standard":
        return "Train"
    else:
        return "Flight"


def get_recommended_places(destination):
    if destination.lower() == "japan":
        return [
            "Tokyo Tower",
            "Shibuya",
            "Mount Fuji"
        ]
    else:
        return [
            "Local attraction",
            "City center",
            "Popular landmark"
        ]