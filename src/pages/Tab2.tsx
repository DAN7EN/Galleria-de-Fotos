import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFab, IonFabButton, IonIcon, IonGrid, IonRow, IonCol, IonImg, IonActionSheet } from '@ionic/react';
import { camera, trash, close } from 'ionicons/icons';
import { ServicioFoto, UserPhoto } from '../Servicio/ServicioFoto';

const Tab2: React.FC = () => {
  const { eliminarfoto, photos, TomarFoto } = ServicioFoto();
  const [photoToDelete, FotoEliminar] = useState<UserPhoto>();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Galeria de fotos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* Encabezado colapsado de la página */}
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Galeria</IonTitle>
          </IonToolbar>
        </IonHeader>
        {/* Grid para mostrar las fotos */}
        <IonGrid>
          <IonRow>
            {photos.map((photo, index) => (
              <IonCol size="6" key={index}>
                {/* Imagen de la galería, al hacer clic llama a FotoEliminar con la foto */}
                <IonImg onClick={() => FotoEliminar(photo)} src={photo.webviewPath} />
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        {/* Botón flotante para abrir la camara y tomar una nueva foto */}
        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={() => TomarFoto()}>
            <IonIcon icon={camera}></IonIcon>
          </IonFabButton>
        </IonFab>
        {/* Hoja de acciones para eliminar fotos */}
        <IonActionSheet
          isOpen={!!photoToDelete}
          buttons={[{
            text: 'Borrar',
            role: 'destructive',
            icon: trash,
            handler: () => {
              if (photoToDelete) {
                // Llama a la función eliminarfoto con la foto a eliminar y reinicia el estado
                eliminarfoto(photoToDelete);
                FotoEliminar(undefined);
              }
            }
          }, {
            text: 'Cancel',
            icon: close,
            role: 'cancel'
          }]}
          onDidDismiss={() => FotoEliminar(undefined)}// Reinicia el estado cuando se cierra la hoja de acciones
        />


      </IonContent>
    </IonPage>
  );
};

export default Tab2;
