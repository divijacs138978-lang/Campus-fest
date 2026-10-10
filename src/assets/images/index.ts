import techCubeImg from './tech_cube_3d_1791541070448.jpg';
import culturalMusicImg from './cultural_music_3d_1791541087964.jpg';
import gamingControllerImg from './gaming_controller_3d_1791541108882.jpg';
import workshopGearImg from './workshop_gear_3d_1791541135366.jpg';
import qrDigitalPassImg from './qr_digital_pass_3d_1791544039629.jpg';

export const ASSET_3D = {
  tech: techCubeImg,
  cultural: culturalMusicImg,
  gaming: gamingControllerImg,
  workshop: workshopGearImg,
  qrPass: qrDigitalPassImg,
};

export const getEvent3DAsset = (category: string, title?: string): string => {
  const lowerCat = (category || '').toLowerCase();
  const lowerTitle = (title || '').toLowerCase();

  if (lowerCat.includes('tech') || lowerTitle.includes('hack') || lowerTitle.includes('code') || lowerTitle.includes('ai')) {
    return techCubeImg;
  }
  if (lowerCat.includes('cultural') || lowerCat.includes('music') || lowerTitle.includes('dance') || lowerTitle.includes('tarang') || lowerTitle.includes('night')) {
    return culturalMusicImg;
  }
  if (lowerCat.includes('sport') || lowerCat.includes('game') || lowerTitle.includes('esport') || lowerTitle.includes('gaming') || lowerTitle.includes('tournament')) {
    return gamingControllerImg;
  }
  return workshopGearImg;
};
