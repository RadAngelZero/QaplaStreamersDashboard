
export async function notifyUpdateToQaplaAdmins(streamId, streamerName, newDateObject = new Date()) {
    await fetch(
        'https://discordapp.com/api/webhooks/692800624017801287/E68ViYaO34VMvCdfiRuADcTVSo_B-azRz0RiSo_L6EU39gAofnDTuOuiyWEYHbbMGQZE',
        {
            method: 'POST',
            headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content: `Evento de ${streamerName} ha cambiado de fecha\nNueva fecha: ${newDateObject.toLocaleString('es-mx')}\nID del evento: ${streamId}\n<@586019077546442752>`,
            	username: "Qapla Match Announcer",
				tts: false
			})
        }
    );
}