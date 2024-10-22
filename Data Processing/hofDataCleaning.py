import pandas as pd


player_stats = pd.read_csv("Data/NBA_players_clean.csv")

hall_of_fame = pd.read_csv("Data/NBA Hall of Famers.csv")

hall_of_fame['In_Hall_of_fame'] = hall_of_fame['In_Hall_of_fame'].apply(lambda x: 1 if x == 1 else 0)

'''
print(player_stats.head())
print(hall_of_fame.head())
'''

def clean_name(name):
    if isinstance(name, str):
        return name.replace('*', '').strip()
    return name

#Ensure uniform names
player_stats['Player'] = player_stats['Player'].str.strip()
player_stats['Player'] = player_stats['Player'].apply(clean_name)

hall_of_fame['Player'] = hall_of_fame['Player'].str.strip()

#merge data
merged_data = pd.merge(player_stats, hall_of_fame, on='Player', how='left')
merged_data['In_Hall_of_fame'] = merged_data['In_Hall_of_fame'].fillna(0)

print(merged_data.head())

'''
hof_players = merged_data[merged_data['In_Hall_of_fame'] == 1.0]
print("Hall of fame players: \n") 
print(hof_players['Player'])
'''

#limit data to eligible and relevant data
eligible_players = merged_data[merged_data['To'] < 2017]
compressed = eligible_players[eligible_players['To'] > 1955]

#print("Eligible players: \n" + str(eligible_players))

#export cleaned data set
compressed.to_csv('hof_data.csv', index=False)
