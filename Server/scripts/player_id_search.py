import sys
from nba_api.live.nba.endpoints.scoreboard import ScoreBoard



def main():
    try: 
        print(ScoreBoard().score_board_date)
    except Exception as e: 
        print(f"Error on Python call: {e}")
        
    
        
        
if __name__ == "__main__":
    main()
