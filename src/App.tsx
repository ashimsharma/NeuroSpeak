import { useState } from "react";
import { RiSpeakAiFill } from "react-icons/ri";
import axios from "axios";
import LoadingPopup from "./components/LoadingPopup";

export default function App() {
	const [inputText, setInputText] = useState("");
	const [outputText, setOutputText] = useState("");
	const [inLang, setInLang] = useState("en");
	const [outLang, setOutLang] = useState("fr");
	const [showPopup, setShowPopup] = useState(false);

	const langCodes: { [key: string]: string } = {
		en: "English",
		fr: "French",
		es: "Spanish",
		de: "German",
	};

	const langModels: { [key: string]: string } = {
		en: "aura-asteria-en",
		fr: "aura-2-hector-fr",
		es: "aura-2-alvaro-es",
		de: "aura-2-julius-de",
	};

	const translateText = async () => {
		setShowPopup(true);

		const options = {
			method: "POST",
			url: import.meta.env.VITE_RAPID_API_URL,
			headers: {
				"x-rapidapi-key": import.meta.env.VITE_RAPID_API_KEY,
				"x-rapidapi-host": "deep-translate1.p.rapidapi.com",
				"Content-Type": "application/json",
			},
			data: {
				q: inputText,
				source: inLang,
				target: outLang,
			},
		};

		try {
			const response = await axios.request(options);
			setOutputText(response.data.data.translations.translatedText[0]);
			setShowPopup(false);
		} catch (error) {
			console.error(error);
		}
	};

	async function textToSpeechDeepgram({
		text = "",
		voice = "aura-asteria-en",
		model = "aura-asteria-en",
		encoding = "mp3",
	}) {
		const response = await fetch(
			`https://api.deepgram.com/v1/speak?model=${model}&encoding=${encoding}`,
			{
				method: "POST",
				headers: {
					Authorization: `Token ${
						import.meta.env.VITE_DEEPGRAM_API_KEY
					}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					text,
				}),
			}
		);

		if (!response.ok) {
			const err = await response.text();
			throw new Error(`Deepgram TTS failed: ${err}`);
		}

		// Get raw audio data
		const arrayBuffer = await response.arrayBuffer();

		return arrayBuffer;
	}

	async function speak(text: string, voice: string, model: string) {
		const audioBuffer = await textToSpeechDeepgram({
			text,
			voice, 
			model
		});

		const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
		const url = URL.createObjectURL(blob);

		const audio = new Audio(url);
		audio.play();
	}

	return (
		<>
			<LoadingPopup show={showPopup} />
			<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
				<div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-xl space-y-6">
					<div className="flex gap-2 justify-center">
						<h1 className="text-2xl font-bold text-center">
							NEURO SPEAK
						</h1>
						<RiSpeakAiFill size={40} />
					</div>
					{/* Language Selection Panel */}
					<div className="flex gap-4 justify-between">
						{/* Input Language */}
						<div className="flex flex-col w-1/2">
							<label className="text-sm font-semibold mb-1">
								From
							</label>
							<select
								value={inLang}
								className="border p-2 rounded-lg"
								onChange={(e) => setInLang(e.target.value)}
							>
								<option value="fr">French</option>
								<option value="en">English</option>
								<option value="es">Spanish</option>
								<option value="de">German</option>
							</select>
						</div>

						{/* Output Language */}
						<div className="flex flex-col w-1/2">
							<label className="text-sm font-semibold mb-1">
								To
							</label>
							<select
								value={outLang}
								className="border p-2 rounded-lg"
								onChange={(e) => setOutLang(e.target.value)}
							>
								<option value="fr">French</option>
								<option value="en">English</option>
								<option value="es">Spanish</option>
								<option value="de">German</option>
							</select>
						</div>
					</div>

					{/* Editable Text Box */}
					<textarea
						className="w-full p-3 border rounded-lg resize-none"
						rows={5}
						placeholder="Paste or type your text here..."
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
					/>

					<textarea
						className="w-full p-3 border rounded-lg bg-gray-100 resize-none"
						rows={5}
						placeholder="Translated Text..."
						value={outputText}
						readOnly
					/>

					<button
						onClick={translateText}
						className="w-full py-3 bg-black text-white rounded-lg hover:opacity-90"
					>
						Translate
					</button>

					<div className="flex gap-3">
						<button
							onClick={() => speak(inputText, langModels[inLang], langModels[inLang])}
							className="w-full py-3 bg-black text-white rounded-lg hover:opacity-90"
						>
							Read {langCodes[inLang]} Excerpt
						</button>
						<button
							onClick={() => speak(outputText, langModels[outLang], langModels[outLang])}
							className="w-full py-3 bg-black text-white rounded-lg hover:opacity-90"
						>
							Read {langCodes[outLang]} Excerpt
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
