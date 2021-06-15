
export async function notifyUpdateToQaplaAdmins(streamId, streamerName, newDateObject = new Date()) {
    await fetch(
		'https://discord.com/api/webhooks/854481795700490280/qCl8z1-IDV6WQ-teWP69zDMULfFJ3jJb_brQYbUA1XiW7o2kE6EkXKI_k5ayU-HP64Ho',
        {
            method: 'POST',
            headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content: `Evento de ${streamerName} ha cambiado de fecha\nNueva fecha: ${newDateObject.toLocaleString('es-mx')}\nID del evento: ${streamId}\n<@524674047456444416>`,
            	username: "Qapla Date Notifier",
				tts: false
			})
        }
    );
}