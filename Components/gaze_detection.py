import cv2
import mediapipe as mp
import numpy as np
import math

# === INITIALIZATION ===
# Load MediaPipe face mesh model with iris refinement enabled
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,  # Enables iris landmark detection
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6)

# Drawing utilities from MediaPipe
mp_drawing = mp.solutions.drawing_utils
# Drawing spec for landmark visualization
drawing_spec = mp_drawing.DrawingSpec(thickness=1, circle_radius=1)

# === LANDMARK INDICES ===
# Indices for iris landmarks
LEFT_IRIS = 468
RIGHT_IRIS = 473

# Eye landmarks for EAR and eye shape
LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]
LEFT_EYE_UP = 159
LEFT_EYE_DOWN = 145
RIGHT_EYE_UP = 386
RIGHT_EYE_DOWN = 374

# === GLOBAL VARIABLES ===
blink_counter = 0           # Counts frames under EAR threshold
total_blinks = 0            # Total blink count
EAR_THRESHOLD = 0.21        # Blink detection threshold
BLINK_FRAMES = 3            # Frames below EAR to consider a blink

GazeAwayLimit = 3           # Frames of looking away before cheating flagged

# Trackers for logging state changes
gaze_away_counter = 0
gaze_flagged = False
last_gaze = ""
last_cheating = False
last_blink_count = 0

# === UTILITY FUNCTIONS ===
def euclidean(p1, p2):
    # Computes Euclidean distance between two points
    return math.hypot(p1[0] - p2[0], p1[1] - p2[1])

def calculate_ear(landmarks, indices, w, h):
    # Computes Eye Aspect Ratio (EAR) to detect blinking
    points = [(int(landmarks[i].x * w), int(landmarks[i].y * h)) for i in indices]
    A = euclidean(points[1], points[5])
    B = euclidean(points[2], points[4])
    C = euclidean(points[0], points[3])
    return (A + B) / (2.0 * C)

def detect_eye_movement(landmarks, w, h):
    # Estimates gaze direction based on iris position relative to eye boundaries

    # Get pixel positions of iris centers
    left_iris = (int(landmarks[LEFT_IRIS].x * w), int(landmarks[LEFT_IRIS].y * h))
    right_iris = (int(landmarks[RIGHT_IRIS].x * w), int(landmarks[RIGHT_IRIS].y * h))

    # Define boundaries of eyes for both sides
    left_outer = int(landmarks[33].x * w)
    left_inner = int(landmarks[133].x * w)
    left_up = int(landmarks[159].y * h)
    left_down = int(landmarks[145].y * h)

    right_outer = int(landmarks[362].x * w)
    right_inner = int(landmarks[263].x * w)
    right_up = int(landmarks[386].y * h)
    right_down = int(landmarks[374].y * h)

    # Calculate relative horizontal position of irises
    # Horizontal ratio (0 = left, 1 = right)
    horiz_ratio_left = (left_iris[0] - left_outer) / (left_inner - left_outer + 1e-6)
    horiz_ratio_right = (right_iris[0] - right_outer) / (right_inner - right_outer + 1e-6)
    horiz_ratio = (horiz_ratio_left + horiz_ratio_right) / 2

    # Calculate relative vertical position of irises
    # Vertical ratio (0 = top, 1 = bottom)
    vert_ratio_left = (left_iris[1] - left_up) / (left_down - left_up + 1e-6)
    vert_ratio_right = (right_iris[1] - right_up) / (right_down - right_up + 1e-6)
    vert_ratio = (vert_ratio_left + vert_ratio_right) / 2

    # Determine horizontal gaze direction
    horiz_dir = "Left" if horiz_ratio < 0.4 else "Right" if horiz_ratio > 0.6 else "Center"
    # Determine vertical gaze direction
    vert_dir = "Up" if vert_ratio < 0.35 else "Down" if vert_ratio > 0.65 else "Center"
    return horiz_dir, vert_dir

def detect_blink(left_ear, right_ear):
    # Detects blink based on average EAR across both eyes
    global blink_counter, total_blinks
    avg_ear = (left_ear + right_ear) / 2.0
    blink = False

    if avg_ear < EAR_THRESHOLD:
        blink_counter += 1  # Under threshold
    else:
        if blink_counter >= BLINK_FRAMES:
            total_blinks += 1
            blink = True  # Confirm blink
        blink_counter = 0  # Reset for next blink detection

    return blink, total_blinks, avg_ear

def draw_iris(image, landmarks, w, h):
    # Draws a small circle over each iris center for visualization
    left_iris_x = int(landmarks[LEFT_IRIS].x * w)
    left_iris_y = int(landmarks[LEFT_IRIS].y * h)
    right_iris_x = int(landmarks[RIGHT_IRIS].x * w)
    right_iris_y = int(landmarks[RIGHT_IRIS].y * h)

    cv2.circle(image, (left_iris_x, left_iris_y), 2, (0, 255, 255), -1)
    cv2.circle(image, (right_iris_x, right_iris_y), 2, (0, 255, 255), -1)

# === Draw full face mesh ===
def draw_face_mesh(image, face_landmarks):
    # Draws the full face mesh on the image
    mp_drawing.draw_landmarks(
        image=image,
        landmark_list=face_landmarks,
        connections=mp_face_mesh.FACEMESH_TESSELATION,
        landmark_drawing_spec=None,
        connection_drawing_spec=drawing_spec)
    mp_drawing.draw_landmarks(
        image=image,
        landmark_list=face_landmarks,
        connections=mp_face_mesh.FACEMESH_IRISES,
        landmark_drawing_spec=drawing_spec,
        connection_drawing_spec=drawing_spec)
            
# === MAIN EXECUTION ===
# Open webcam
cap = cv2.VideoCapture(0)
# Create log file
log_file = open("eye_tracking_log.txt", "w")
# Setup video writer for recording
fourcc = cv2.VideoWriter_fourcc(*'XVID')
out = cv2.VideoWriter("recorded_eye_tracking.avi", fourcc, 20.0, (640, 480))

while cap.isOpened():
    success, image = cap.read()
    if not success:
        break

    # Flip for mirror view and convert to RGB for MediaPipe
    image = cv2.flip(image, 1)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    h, w, _ = image.shape
    results = face_mesh.process(rgb_image)

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            landmarks = face_landmarks.landmark

            # === Blink detection ===
            left_ear = calculate_ear(landmarks, RIGHT_EYE, w, h)
            right_ear = calculate_ear(landmarks, LEFT_EYE, w, h)
            blink, total_blinks, avg_ear = detect_blink(left_ear, right_ear)

            if blink:
                print("Blink detected!")

            # Show EAR and total blinks on screen
            cv2.putText(image, f"EAR: {avg_ear:.2f}", (30, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 2)
            cv2.putText(image, f"Blinks: {total_blinks}", (30, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)

            # === Iris position and gaze direction ===
            draw_iris(image, landmarks, w, h)
            horiz_dir, vert_dir = detect_eye_movement(landmarks, w, h)
            cv2.putText(image, f"Eye: {horiz_dir}, {vert_dir}", (30, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (150, 255, 0), 2)

            # === Cheating detection logic ===
            if horiz_dir in ["Left", "Right"] or vert_dir in ["Up", "Down"]:
                gaze_away_counter += 1
            else:
                gaze_away_counter = 0
                gaze_flagged = False

            if gaze_away_counter >= GazeAwayLimit:
                gaze_flagged = True
                cv2.putText(image, "Cheating Detected!", (30, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

            # Draw full face mesh for visualization
            draw_face_mesh(image, face_landmarks)
            
    # Save frame to video file
    out.write(image)

    # Log only when something changes
    # if (horiz_dir != last_gaze) or (total_blinks != last_blink_count) or (gaze_flagged != last_cheating):
    # if (horiz_dir != last_gaze) or (total_blinks != last_blink_count):
    log_file.write(f"Gaze_Horizontal: {horiz_dir}, Gaze_Vertical: {vert_dir}, Blinks: {total_blinks}, Cheating: {gaze_flagged}\n")
        # last_gaze = horiz_dir
        # last_blink_count = total_blinks
        # last_cheating = gaze_flagged

    # Display the annotated frame
    cv2.imshow('Eye Tracker', image)
    if cv2.waitKey(5) & 0xFF == ord('q'):
        break

# === Cleanup resources ===
cap.release()
out.release()
log_file.close()
cv2.destroyAllWindows()