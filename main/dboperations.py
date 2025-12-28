from django.db import connection

def get_model_view_for_controller(prm, jsntxt):
    with connection.cursor() as cursor:
        cursor.execute("""
            EXEC dbo.sp_get_model_view_for_controller 
                @param=%s, 
                @JsonTxt=%s
        """, [prm, jsntxt])

        try:
            result = cursor.fetchall()  # Fetch data if the proc returns rows
        except:
            result = None  # No data returned
    return result

def process_json_and_update(prm, usr, jsntxt, df):
    with connection.cursor() as cursor:
        cursor.execute("""
            EXEC dbo.sp_process_json_and_update 
                @spParam=%s, 
                @UserId=%s, 
                @JsonTxt=%s, 
                @dFlag=%s
        """, [prm, usr, jsntxt, df])
        
        # If it returns data (e.g., SELECT), fetch it
        try:
            result = cursor.fetchall()
        except:
            result = None  # if no resultset (e.g., only UPDATE/INSERT)
    return result
