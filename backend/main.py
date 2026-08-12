# # Variables store the trip data
# destination = "Japan"
# days = 5
# budget = 1500
# travel_style = "Family"

# # Reuse them anywhere
# print(destination)      # -> Japan
# print(days)             # -> 5

# # Ask the user for trip details 
# destination = input("Destination : ")
# days = int(input("Days : "))
# budget = float(input("Budget : "))
# travel_style = input("Travel Style : ")

# # Readable, labeled
# print(f"Destination : {destination}")
# print(f"Days : {days}")
# print(f"Budget : {budget}")
# print(f"Style : {travel_style}")

# # functions
# def print_trip_summary(destination, days, budget, travel_style, hotel_cost, transport_cost, food_cost, miscellaneous_cost) :
#     print("===========================")
#     print("KelanaAI")
#     print("===========================")
#     print(f"Destination : {destination}")
#     print(f"Days : {days}")
#     print(f"Budget : {budget}")
#     print(f"Style : {travel_style}")
#     total_cost = hotel_cost + transport_cost + food_cost + miscellaneous_cost

#     print(f"Hotel Cost : {hotel_cost}")
#     print(f"Transport Cost : {transport_cost}")
#     print(f"Food Cost : {food_cost}")
#     print(f"Miscellaneous Cost : {miscellaneous_cost}")
#     print(f"Total Estimated Cost : {total_cost}")

#     if total_cost > budget:
#             print("⚠️ Budget exceeded.")

# # Call it with any trip
# print_trip_summary(
#     "Japan",
#     5,
#     1500,
#     "Family",
#     600,
#     200,
#     300,
#     100
# )

# print_trip_summary(
#     "Bali",
#     3,
#     800,
#     "Backpacker",
#     300,
#     1000,
#     250,
#     50
# )

# Homework Session 1
# input user

destination = input("Destination: ")
country = input("Country: ")
days = int(input("Days: "))
budget = float(input("Budget: "))
currency = input("Currency: ")
month_travel = input("Travel Month: ")

def print_trip_summary(destination, country, days, budget, currency, month_travel) :
    print("===========================")
    print("KelanaAI")
    print("===========================")
    print(f"Destination : {destination}")
    print(f"Country : {country}")
    print(f"Days : {days}")
    print(f"Budget : {budget} {currency}")
    print(f"Currency : {currency}")
    print(f"Month Travel : {month_travel}")

print_trip_summary(
    destination,
    country,
    days,
    budget,
    currency,
    month_travel
)
