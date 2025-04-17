import {FC, useState, useEffect} from "react";
import {ThemedText} from "../ThemedText";
import {TimerBlockProps} from "./types/TimerBlockProps";

export const TimerBlock: FC<TimerBlockProps> = (props) => {
  const [started] = useState(props.start ?? new Date());
  const [end, setEnd] = useState(props.end ?? new Date())
  useEffect(() => {
    if(props.end){
      return
    }
    setTimeout(() => {
      setEnd(new Date())
    },1000)
  })
  const diff = Math.floor(end.getTime() - started.getTime());
  const hourMs = 1000*60*60;
  const minuteMs = 1000*60;
  const secondMs = 1000;
  const hours = Math.floor(diff/hourMs);
  const minutes = Math.floor((diff - hours*hourMs)/minuteMs);
  const seconds = Math.floor((diff - hours*hourMs - minutes*minuteMs)/secondMs)
  const hoursStr = String(hours).padStart(2,'0');
  const minutesStr = String(minutes).padStart(2,'0');
  const secondsStr = String(seconds).padStart(2,'0');
  return <ThemedText {...props}>{hoursStr}:{minutesStr}:{secondsStr}</ThemedText>
}