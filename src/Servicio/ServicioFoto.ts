import { useState, useEffect } from "react";
import { isPlatform } from '@ionic/react';


import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

// Constante que define la clave para almacenar fotos en las preferencias
const PHOTO_STORAGE = 'photos';

// Función que devuelve un objeto con funciones y datos relacionados a las fotos
export function ServicioFoto() {

    // Estado que almacena la lista de fotos  
    const [photos, setPhotos] = useState<UserPhoto[]>([]);

    useEffect(() => {
        const loadSaved = async () => {
            const { value } = await Preferences.get({ key: PHOTO_STORAGE });
            // Convierte la cadena JSON a una lista de fotos
            const photosInPreferences = (value ? JSON.parse(value) : []) as UserPhoto[];
            // Si se está ejecutando en la web, carga las fotos desde el sistema de archivos
            if (!isPlatform('hybrid')) {
                for (let photo of photosInPreferences) {
                    const file = await Filesystem.readFile({
                        path: photo.filepath,
                        directory: Directory.Data
                    });

                    photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
                }
            }
            // Actualiza el estado con las fotos cargadas
            setPhotos(photosInPreferences);
        };
        // Llama a la función para cargar las fotos al inicio
        loadSaved();
    }, []);

    // Función para tomar una nueva foto
    const TomarFoto = async () => {
        const photo = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
            quality: 100
        });
        // Genera un nombre de archivo único para la nueva foto
        const fileName = new Date().getTime() + '.jpeg';
        // Guarda la nueva foto y obtiene el objeto UserPhoto resultante
        const savedFileImage = await GuardarFoto(photo, fileName);
        // Actualiza el estado con la nueva foto
        const newPhotos = [savedFileImage, ...photos];
        setPhotos(newPhotos);
        // Almacena la nueva lista de fotos en las preferencias
        Preferences.set({ key: PHOTO_STORAGE, value: JSON.stringify(newPhotos) });
    };
    
    // Función para guardar una foto en el sistema de archivos
    const GuardarFoto = async (photo: Photo, fileName: string): Promise<UserPhoto> => {
        let base64Data: string;
        // Si se está ejecutando en un entorno híbrido (Capacitor), lee el archivo desde el sistema de archivos
        if (isPlatform('hybrid')) {
            const file = await Filesystem.readFile({
                path: photo.path!
            });

            // Convierte los datos de Blob a cadena si es necesario
            if (file.data instanceof Blob) {
                base64Data = await new Response(file.data).text();
            } else {
                base64Data = file.data;
            }
        } else {
            // Si se está ejecutando en la web, obtén la representación base64 directamente desde la ruta web
            base64Data = await base64FromPath(photo.webPath!);
        }

        // Guarda la foto en el sistema de archivos y obtén el objeto UserPhoto resultante
        const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Data
        });

        // Devuelve el objeto UserPhoto dependiendo del entorno
        if (isPlatform('hybrid')) {

            return {
                filepath: savedFile.uri,
                webviewPath: Capacitor.convertFileSrc(savedFile.uri),
            };
        }
        else {

            return {
                filepath: fileName,
                webviewPath: photo.webPath
            };
        }
    };

    // Función para eliminar una foto
    const eliminarfoto = async (photo: UserPhoto) => {

        // Filtra la lista de fotos para eliminar la foto específica
        const newPhotos = photos.filter(p => p.filepath !== photo.filepath);

        // Almacena la nueva lista de fotos en las preferencias
        Preferences.set({ key: PHOTO_STORAGE, value: JSON.stringify(newPhotos) });

        // Obtiene el nombre del archivo desde la ruta de la foto
        const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);

        // Elimina el archivo del sistema de archivos
        await Filesystem.deleteFile({
            path: filename,
            directory: Directory.Data
        });
        // Actualiza el estado con la nueva lista de fotos
        setPhotos(newPhotos);
    };
    // Devuelve un objeto con funciones y datos relacionados con fotos
    return {
        eliminarfoto,
        photos,
        TomarFoto
    };
}

// Define la interfaz para un objeto de foto de usuario
export interface UserPhoto {
    filepath: string;
    webviewPath?: string;
}

// Función para convertir una ruta de archivo a representación base64 (utilizada en entornos web)
export async function base64FromPath(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject('method did not return a string')
            }
        };
        reader.readAsDataURL(blob);
    });
}
