import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import './App.css'; // Asegúrate de tener estilos para la navbar
import { useState } from 'react';

function Navbar({ setSection }) {
    return (
        <nav style={{ backgroundColor: '#333', padding: '1rem', color: 'white' }}>
            <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0 }}>
                <li style={{ marginRight: '1rem' }}>
                    <a href="#" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setSection('inicio')}>Inicio</a>
                </li>
                <li style={{ marginRight: '1rem' }}>
                    <a href="#" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setSection('modelo')}>Modelo</a>
                </li>
                <li style={{ marginRight: '1rem' }}>
                    <a href="#" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setSection('camara')}>Cámara</a>
                </li>
                <li>
                    <a href="#" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setSection('contacto')}>Contacto</a>
                </li>
            </ul>
        </nav>
    );
}

function Model() {
    const geometry = useLoader(STLLoader, '/model.STL');

    return (
        <mesh geometry={geometry} scale={[0.1, 0.1, 0.1]}>
            <meshStandardMaterial color="blue" />
        </mesh>
    );
}

function Camera() {
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  const openCamera = async () => {
      try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(mediaStream);
      } catch (error) {
          console.error('Error al acceder a la cámara:', error);
      }
  };

  const takePhoto = () => {
    if (!stream) return;

    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhoto(dataUrl);
        sendPhotoToApi(dataUrl);
    };
};


  const sendPhotoToApi = async (dataUrl) => {
      try {
          const blob = await fetch(dataUrl).then((res) => res.blob());
          const formData = new FormData();
          formData.append('file', blob, 'photo.jpg');

          const response = await fetch('https://monumentos-historicos-e45c66f49b57.herokuapp.com//predict', {
              method: 'POST',
              body: formData,
          });

          const result = await response.json();
          setApiResponse(result);
      } catch (error) {
          console.error('Error al enviar la foto a la API:', error);
          setApiResponse({ error: 'No se pudo procesar la imagen.' });
      }
  };

  return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1rem' }}>
          {/* Columna izquierda: Cámara */}
          <div style={{ flex: 1, textAlign: 'center', padding: '1rem' }}>
              <button onClick={openCamera} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>Abrir Cámara</button>
              {stream && (
                  <div style={{ marginTop: '1rem' }}>
                      <video
                          autoPlay
                          playsInline
                          style={{ width: '100%', maxWidth: '300px' }}
                          ref={(video) => {
                              if (video) video.srcObject = stream;
                          }}
                      />
                      <button onClick={takePhoto} style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '1rem' }}>
                          Tomar Foto
                      </button>
                  </div>
              )}
          </div>

          {/* Columna central: Foto tomada */}
          <div style={{ flex: 1, textAlign: 'center', padding: '1rem' }}>
              {photo && (
                  <div>
                      <h3>Foto tomada</h3>
                      <img src={photo} alt="Foto tomada" style={{ width: '100%', maxWidth: '300px' }} />
                  </div>
              )}
          </div>

          {/* Columna derecha: Respuesta de la API */}
          <div style={{ flex: 1, textAlign: 'center', padding: '1rem', color: 'black' }}>
              {apiResponse && (
                  <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
                      <h3>Respuesta de la API</h3>
                      <pre style={{ textAlign: 'left' }}>{JSON.stringify(apiResponse, null, 2)}</pre>
                  </div>
              )}
          </div>
      </div>
  );
}

export default function App() {
    const [section, setSection] = useState('inicio');

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Navbar setSection={setSection} />
            {section === 'inicio' && <div style={{ padding: '2rem', textAlign: 'center' }}>Bienvenido a la aplicación</div>}
            {section === 'modelo' && (
                <Canvas camera={{ position: [0, 0, 5] }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 5, 5]} />
                    <Model />
                    <OrbitControls />
                </Canvas>
            )}
            {section === 'camara' && <Camera />}
            {section === 'contacto' && <div style={{ padding: '2rem', textAlign: 'center' }}>Contacto: contacto@ejemplo.com</div>}
        </div>
    );
}