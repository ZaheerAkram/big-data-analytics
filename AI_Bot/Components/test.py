from add_history import read_messages

history = read_messages("interview_log.json")
# print(history)

candidate_id = "110"  # Use string if that's how it's stored in JSON
candidate_history = None

# for record in history:
#     if candidate_id in record:
#         print("Candidate ID found in history.")
#         candidate_history = record[candidate_id]
#         print("Candidate History:", candidate_history)
#         break
# else:
#     print("Candidate ID not found in history.")


if history:
    print("History is not empty.")