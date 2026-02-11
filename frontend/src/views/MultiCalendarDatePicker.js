import React, { useEffect, useMemo, useRef, useState } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import Settings from "react-multi-date-picker/plugins/settings";
import Toolbar from "react-multi-date-picker/plugins/toolbar";
import transition from "react-element-popper/animations/transition";
import opacity from "react-element-popper/animations/opacity";
import persian from "react-date-object/calendars/persian";
import arabic from "react-date-object/calendars/arabic";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";

const SHAMSI_MONTHS_AF = [
    "حمل",
    "ثور",
    "جوزا",
    "سرطان",
    "اسد",
    "سنبله",
    "میزان",
    "عقرب",
    "قوس",
    "جدی",
    "دلو",
    "حوت",
];

const QAMARI_MONTHS_AR = [
    "محرم",
    "صفر",
    "ربیع الاول",
    "ربیع الثانی",
    "جمادی الاول",
    "جمادی الثانی",
    "رجب",
    "شعبان",
    "رمضان",
    "شوال",
    "ذوالقعده",
    "ذوالحجه",
];

const GREG_MONTHS_EN = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

// Sanitize any incoming date string into YYYY-MM-DD (or "")
function sanitizeGregorian(value) {
    if (!value) return "";
    const v = String(value).trim();
    if (!v) return "";

    const first10 = v.slice(0, 10);
    const normalized = first10.replaceAll("/", "-");

    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return "";

    return normalized;
}

// Normalize picker onChange value into DateObject
function normalizeToDateObject(raw, calendar) {
    if (!raw) return null;
    if (raw instanceof DateObject) return raw;
    if (raw instanceof Date) return new DateObject({ date: raw, calendar });
    try {
        return new DateObject({ date: raw, calendar });
    } catch {
        return null;
    }
}

const MultiCalendarDatePicker = ({
    label = "Date",
    value,
    onChange,
    defaultToToday = true,
    closeOnSelect = true,
    disabled = false,
    error = null,
    wrapperClassName = "",
    labelClassName = "form-label",
    fieldBodyClassName = "flex-grow-1",
    containerClassName = "",
    inputClassName = "form-control",
    inputStyle,
    displayFormat = "YYYY-MM-DD",
}) => {
    const pickerRef = useRef(null);
    const [pickerProps, setPickerProps] = useState({
        calendar: persian,
        locale: gregorian_en,
    });

    const [selected, setSelected] = useState(null);

    const activeCalendarName = String(
        pickerProps.calendar?.name || "persian"
    ).toLowerCase();

    const months = useMemo(() => {
        if (activeCalendarName === "persian") return SHAMSI_MONTHS_AF;
        if (activeCalendarName === "arabic") return QAMARI_MONTHS_AR;
        if (activeCalendarName === "gregorian") return GREG_MONTHS_EN;
        return undefined;
    }, [activeCalendarName]);

    const toolbarNames = useMemo(() => {
        if (activeCalendarName === "gregorian")
            return { today: "Today", deselect: "Clear", close: "OK" };
        if (activeCalendarName === "arabic")
            return { today: "اليوم", deselect: "مسح", close: "حسناً" };
        return { today: "امروز", deselect: "پاک کردن", close: "تایید" };
    }, [activeCalendarName]);

    // Default today if parent value is empty
    useEffect(() => {
        if (!defaultToToday) return;

        const v = sanitizeGregorian(value);
        if (v) return;

        const today = new DateObject({ date: new Date(), calendar: gregorian }).format("YYYY-MM-DD");
        onChange(today);

        const display = new DateObject({ date: today, calendar: gregorian }).convert(pickerProps.calendar);
        setSelected(display);
    }, []);

    // Sync from parent value
    useEffect(() => {
        const v = sanitizeGregorian(value);
        if (!v) return;

        const g = new DateObject({ date: v, calendar: gregorian });
        setSelected(g.convert(pickerProps.calendar));
    }, [value, pickerProps.calendar]);

    const baseInputStyle = {
        width: "100%",
        height: 38,
        borderRadius: "0.357rem",
        padding: "0.438rem 1rem",
        border: `1px solid ${error ? "#ea5455" : "#d8d6de"}`,
        backgroundColor: "transparent",
    };

    return (
        <div className={wrapperClassName}>
            {label ? <label className={labelClassName}>{label}</label> : null}

            <div className={fieldBodyClassName} style={{ minWidth: 0 }}>
                <DatePicker
                    ref={pickerRef}
                    value={selected}
                    calendar={pickerProps.calendar}
                    locale={gregorian_en}
                    months={months}
                    format={displayFormat}
                    disabled={disabled}
                    onPropsChange={(next) => {
                        setPickerProps((prev) => ({
                            ...prev,
                            calendar: next?.calendar ?? prev.calendar,
                            locale: prev.locale,
                        }));
                    }}
                    containerClassName={`w-100 ${containerClassName}`}
                    containerStyle={{ width: "100%" }}
                    inputClass={inputClassName}
                    style={{ ...baseInputStyle, ...(inputStyle || {}) }}
                    portal
                    hideOnScroll
                    zIndex={9999}
                    calendarPosition="bottom-right"
                    animations={[opacity(), transition()]}
                    onChange={(raw, ctx) => {
                        const dObj = normalizeToDateObject(raw, pickerProps.calendar);
                        if (!dObj) return;

                        setSelected(dObj);
                        const g = dObj.convert(gregorian).format("YYYY-MM-DD");
                        onChange(g);

                        if (closeOnSelect) {
                            ctx?.closeCalendar?.();
                            pickerRef.current?.closeCalendar?.();
                        }
                    }}
                    plugins={[
                        <Settings
                            key="settings"
                            position="bottom"
                            defaultActive="calendar"
                            calendars={["persian", "arabic", "gregorian"]}
                            locales={["fa", "ar", "en"]}
                            disabledList={["other", "mode"]}
                            names={{
                                persian: "ش",
                                arabic: "ق",
                                gregorian: "م",
                                fa: "فا",
                                ar: "عر",
                                en: "EN",
                            }}
                        />,
                        <Toolbar key="toolbar" position="bottom" names={toolbarNames} />,
                    ]}
                />
            </div>
        </div>
    );
};

export default MultiCalendarDatePicker;