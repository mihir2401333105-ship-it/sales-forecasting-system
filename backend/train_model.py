import pandas as pd
import matplotlib.pyplot as plt
import pickle
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
import matplotlib.pyplot as plt
# ----------------------------
# 1. Load Dataset
# ----------------------------
data = pd.read_csv("sales.csv")

print(data.head())
print(data.info())

# ----------------------------
# 2. Define Features and Target
# ----------------------------
X = data[['Year', 'Month']]
y = data['Sales']

# ----------------------------
# 3. Train Test Split
# ----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ----------------------------
# 4. Train Model
# ----------------------------
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# ----------------------------
# 5. Predictions
# ----------------------------
predictions = model.predict(X_test)

# ----------------------------
# 6. Model Evaluation
# ----------------------------
print("\nModel Performance:")
print("R2 Score:", r2_score(y_test, predictions))
print("MAE:", mean_absolute_error(y_test, predictions))

# ----------------------------
# 7. Actual vs Predicted Graph
# ----------------------------
plt.figure()
plt.scatter(y_test, predictions)
plt.xlabel("Actual Sales")
plt.ylabel("Predicted Sales")
plt.title("Actual vs Predicted Sales")
plt.show()

# ----------------------------
# 8. Feature Importance
# ----------------------------
importance = model.feature_importances_

plt.figure()
plt.bar(['Year', 'Month'], importance)
plt.title("Feature Importance")
plt.show()

# ----------------------------
# 9. Predict Next 1 Year Sales
# ----------------------------
future_data = []

year = 2026
for month in range(1, 13):
    future_data.append([year, month])

future_df = pd.DataFrame(future_data, columns=["Year", "Month"])

future_predictions = model.predict(future_df)

future_df["Predicted_Sales"] = future_predictions

print("\nNext 1 Year Sales Forecast:\n")
print(future_df)

# ----------------------------
# 10. Forecast Visualization
# ----------------------------
plt.figure()
plt.plot(future_df["Month"], future_df["Predicted_Sales"], marker='o')
plt.xlabel("Month")
plt.ylabel("Predicted Sales")
plt.title("Sales Forecast for 2026")
plt.show()

# ----------------------------
# 11. Save Forecast to CSV
# ----------------------------
future_df.to_csv("sales_forecast_2026.csv", index=False)

print("\nForecast saved as sales_forecast_2026.csv ✅")
# ----------------------------
# 12. Save Model
# ----------------------------
pickle.dump(model, open("sales_model.pkl", "wb"))

print("Model saved as sales_model.pkl ✅")

# ----------------------------
# Historical Sales Graph
# ----------------------------

data["Date"] = data["Year"].astype(str) + "-" + data["Month"].astype(str)

plt.figure(figsize=(10,5))

plt.plot(
    data["Date"],
    data["Sales"],
    marker="o",
    linewidth=2,
    label="Historical Sales"
)

plt.xlabel("Date")
plt.ylabel("Sales")
plt.title("Historical Sales Trend")
plt.xticks(rotation=45)

plt.grid(True)
plt.legend()

plt.tight_layout()
plt.savefig("historical_sales_graph.png")

print("Historical sales graph saved ✅")
# ----------------------------
# Predicted Sales Graph
# ----------------------------

future_df["Date"] = future_df["Year"].astype(str) + "-" + future_df["Month"].astype(str)

plt.figure(figsize=(10,5))

plt.plot(
    future_df["Date"],
    future_df["Predicted_Sales"],
    marker="o",
    linestyle="--",
    linewidth=2,
    label="Predicted Sales"
)

plt.xlabel("Date")
plt.ylabel("Predicted Sales")
plt.title("Sales Forecast for Next Year")
plt.xticks(rotation=45)

plt.grid(True)
plt.legend()

plt.tight_layout()
plt.savefig("predicted_sales_graph.png")

print("Predicted sales graph saved ✅")