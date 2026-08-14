def calculate_daily_budget(budget, days):
    return budget / days


def get_trip_category(budget):
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"

def get_travel_season(month):
    month_clean = month.strip().lower()
    
    if month == "December" or month == 12:
        return "Peak Season"
    elif month == "June" or month == 6:
        return "Holiday Season"
    else:
        return "Regular Season"

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