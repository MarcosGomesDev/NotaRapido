import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void;
}

let speechRecognition: SpeechRecognition | null = null;

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldOnBoarding, setShouldOnBoarding] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  function handleStartEditor() {
    setShouldOnBoarding(false);
  }

  function handeContentChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value);

    if (event.target.value === "") {
      setShouldOnBoarding(true);
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault();

    if (content === "") {
      return;
    }

    onNoteCreated(content);

    setContent("");
    setOpen(false);
    setShouldOnBoarding(true);

    toast.success("Nota criada com sucesso!");
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvaliable =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

    if (!isSpeechRecognitionAPIAvaliable) {
      alert("Seu navegador não suporta a API de reconhecimento de voz.");
      return;
    }

    setIsRecording(true);
    setShouldOnBoarding(false);

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    speechRecognition = new SpeechRecognitionAPI();

    speechRecognition.lang = "pt-BR";
    speechRecognition.continuous = true;
    speechRecognition.maxAlternatives = 1;
    speechRecognition.interimResults = true;

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, "");

      setContent(transcription);
    };

    speechRecognition.onerror = (event) => {
      console.error(event.error);
    };

    speechRecognition.start();
  }

  function handlStopRecording() {
    setIsRecording(false);

    if (speechRecognition) {
      speechRecognition.stop();
    }

    return;
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="rounded-md flex flex-col text-left bg-slate-700 p-5 gap-3 outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 relative overflow-hidden">
        <div className="absolute right-0 top-0 size-8 bg-slate-800 flex items-center justify-center">
          <ArrowUpRight className="text-slate-600 size-5" />
        </div>
        <span className="text-sm font-medium text-slate-200">
          Adicionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400">
          Grave uma nota em áudio que será convertida para texto
          automaticamente.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50">
          <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
            <Dialog.Close className="absolute top-0 right-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
              <X className="size-5" />
            </Dialog.Close>

            <form className="flex-1 flex flex-col">
              <div className="flex flex-1 flex-col gap-3 p-5">
                <span className="text-sm font-medium text-slate-300">
                  Adicionar nota
                </span>
                {shouldOnBoarding ? (
                  <p className="text-sm leading-6 text-slate-400">
                    Comece{" "}
                    <button
                      type="button"
                      className="font-medium text-lime-400 hover:underline"
                      onClick={handleStartRecording}
                    >
                      gravando uma nota
                    </button>{" "}
                    em áudio ou se preferir{" "}
                    <button
                      type="button"
                      className="font-medium text-lime-400 hover:underline"
                      onClick={handleStartEditor}
                    >
                      utilize apenas texto
                    </button>
                    .
                  </p>
                ) : (
                  <textarea
                    autoFocus
                    className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                    onChange={handeContentChange}
                    value={content}
                  />
                )}
              </div>

              {isRecording ? (
                <button
                  type="button"
                  onClick={handlStopRecording}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100"
                >
                  <div className="size-3 rounded-full bg-red-500 animate-pulse" />{" "}
                  Gravando! (clique p/ interromper)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
                >
                  Salvar nota
                </button>
              )}
            </form>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
