import cv2
import mediapipe as mp
import numpy as np

# Initialize MediaPipe Face Mesh
def init_face_mesh():
    mp_face_mesh = mp.solutions.face_mesh
    return mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1), mp_face_mesh

# Get 2D facial keypoints for pose estimation
def get_image_points(landmarks, image_width, image_height):
    # Chosen 6 points: Nose tip, Chin, Left eye corner, Right eye corner, Left mouth corner, Right mouth corner

    indices = [1, 152, 263, 33, 287, 57]
    image_points = []

    for idx in indices:
        lm = landmarks[idx]
        x = int(lm.x * image_width)
        y = int(lm.y * image_height)
        image_points.append((x, y))

    return np.array(image_points, dtype=np.float64)

# 3D model reference points (assumed for generic face model)
def get_3d_model_points():
    return np.array([
        (0.0, 0.0, 0.0),         # Nose tip
        (0.0, -100.0, -30.0),    # Chin
        (50.0, 50.0, -50.0),     # Right eye right corner
        (-50.0, 50.0, -50.0),    # Left eye left corner
        (30.0, -50.0, -50.0),    # Right Mouth corner
        (-30.0, -50.0, -50.0)    # Left Mouth corner
    ])

# Calculate rotation (yaw, pitch, roll)
def estimate_pose(image_points, frame_shape):
    model_points = get_3d_model_points()
    height, width = frame_shape[:2]

    focal_length = width
    center = (width / 2, height / 2)
    camera_matrix = np.array([
        [focal_length, 0, center[0]],
        [0, focal_length, center[1]],
        [0, 0, 1]
    ], dtype="double")

    dist_coeffs = np.zeros((4, 1))  # Assuming no lens distortion

    success, rotation_vector, translation_vector = cv2.solvePnP(
        model_points, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE
    )

    return rotation_vector

# Convert rotation vector to yaw, pitch, roll
def get_euler_angles(rotation_vector):
    rotation_matrix, _ = cv2.Rodrigues(rotation_vector)
    sy = np.sqrt(rotation_matrix[0, 0]**2 + rotation_matrix[1, 0]**2)
    singular = sy < 1e-6

    if not singular:
        pitch = np.arctan2(rotation_matrix[2, 1], rotation_matrix[2, 2])
        yaw = np.arctan2(-rotation_matrix[2, 0], sy)
        roll = np.arctan2(rotation_matrix[1, 0], rotation_matrix[0, 0])
    else:
        pitch = np.arctan2(-rotation_matrix[1, 2], rotation_matrix[1, 1])
        yaw = np.arctan2(-rotation_matrix[2, 0], sy)
        roll = 0

    return np.degrees([pitch, yaw, roll])

def classify_head_pose(pitch, yaw, roll):
    # Pitch - Up/Down
    if pitch < 165 and pitch > 125:
        pitch_text = "Looking Up"
    elif pitch > -120 and pitch < -100:
        pitch_text = "Looking Down"
    else:
        pitch_text = "Facing Forward"
        
    # Yaw - Left/Right
    if yaw > 15:
        yaw_text = "Looking Right"
    elif yaw < -15:
        yaw_text = "Looking Left"
    else:
        yaw_text = "Facing Forward"

    # Roll - Tilt
    if roll < 160 and roll > -49:
        roll_text = "Head Tilt Right"
    elif roll > -160 and roll < -145:
        roll_text = "Head Tilt Left"
    else:
        roll_text = "Head Straight"

    return pitch_text, yaw_text, roll_text

# Main loop for webcam-based tracking
def main():
    face_mesh, mp_face_mesh = init_face_mesh()
    cap = cv2.VideoCapture(0)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb)

        if results.multi_face_landmarks:
            landmarks = results.multi_face_landmarks[0].landmark
            image_points = get_image_points(landmarks, frame.shape[1], frame.shape[0])
            rotation_vector = estimate_pose(image_points, frame.shape)
            pitch, yaw, roll = get_euler_angles(rotation_vector)

            # Display the results
            cv2.putText(frame, f"Pitch: {pitch:.2f}", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Yaw:   {yaw:.2f}", (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
            cv2.putText(frame, f"Roll:  {roll:.2f}", (20, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

            # Get string-based movement interpretation
            pitch_text, yaw_text, roll_text = classify_head_pose(pitch, yaw, roll)

            # Show the string-based feedback
            cv2.putText(frame, f"Pitch: {pitch_text}", (20, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Yaw:   {yaw_text}", (20, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
            cv2.putText(frame, f"Roll:  {roll_text}", (20, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)


            # Optionally draw keypoints
            for point in image_points:
                cv2.circle(frame, (int(point[0]), int(point[1])), 3, (0, 255, 255), -1)

        cv2.imshow("MediaPipe Head Pose Estimation", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
