// Entwicklungsmodus aktivieren (für lokales Testen ohne Backend)
window.process = {
    env: {
        NODE_ENV: 'development'
    }
};

// booking.js - Frontend-Integration mit dem Backend
document.addEventListener('DOMContentLoaded', function() {
    // Elemente abrufen
    const serviceSelect = document.getElementById('serviceSelect');
    const staffSelect = document.getElementById('staffSelect');
    const datePicker = document.getElementById('datePicker');
    const timeSlotsContainer = document.getElementById('timeSlots');
    const calendarDays = document.querySelectorAll('.calendar-day');
    const bookButton = document.getElementById('bookButton');
    const bookingSystem = document.getElementById('bookingSystem');
    const confirmation = document.getElementById('confirmation');
    const newBookingBtn = document.getElementById('newBookingBtn');
    
    const confirmDate = document.getElementById('confirmDate');
    const confirmTime = document.getElementById('confirmTime');
    const confirmService = document.getElementById('confirmService');
    const confirmStylist = document.getElementById('confirmStylist');
    
    // API-Basis-URL (im produktiven Einsatz auf die tatsächliche Backend-URL ändern)
    const API_BASE_URL = 'https://api.timetocut.de';
    
    // Aktuelles Datum für den Datepicker setzen
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${yyyy}-${mm}-${dd}`;
    datePicker.value = formattedToday;
    datePicker.min = formattedToday;
    
    // Event Listener für Kalender-Tage
    calendarDays.forEach(day => {
        if (!day.classList.contains('unavailable')) {
            day.addEventListener('click', function() {
                // Alle Tage deselektieren
                calendarDays.forEach(d => d.classList.remove('selected'));
                
                // Ausgewählten Tag markieren
                this.classList.add('selected');
                
                // Datepicker aktualisieren
                const selectedDay = this.textContent;
                const monthNav = document.querySelector('.month-nav').textContent;
                const [monthName, year] = monthNav.split(' ');
                
                // Monatsnummer basierend auf dem Namen ermitteln
                const months = {
                    'Januar': '01', 'Februar': '02', 'März': '03', 'April': '04',
                    'Mai': '05', 'Juni': '06', 'Juli': '07', 'August': '08',
                    'September': '09', 'Oktober': '10', 'November': '11', 'Dezember': '12'
                };
                
                const monthNumber = months[monthName];
                
                // Datum im Format YYYY-MM-DD setzen
                const formattedDate = `${year}-${monthNumber}-${String(selectedDay).padStart(2, '0')}`;
                datePicker.value = formattedDate;
                
                // Zeitslots für den gewählten Tag und Stylisten laden
                loadAvailableTimeSlots();
            });
        }
    });
    
    // Event Listener für Datepicker-Änderungen
    datePicker.addEventListener('change', function() {
        // Zeitslots für den gewählten Tag und Stylisten laden
        loadAvailableTimeSlots();
        
        // Kalenderansicht anpassen (in vollständiger Implementierung)
        updateCalendarSelection(this.value);
    });
    
    // Event Listener für Stylist-Änderungen
    staffSelect.addEventListener('change', function() {
        // Zeitslots für den gewählten Tag und Stylisten laden
        loadAvailableTimeSlots();
    });
    
    // Funktion zum Laden der verfügbaren Zeitslots vom Backend
    function loadAvailableTimeSlots() {
        const selectedDate = datePicker.value;
        const selectedStylist = staffSelect.value;
        
        // Prüfen, ob Datum und Stylist ausgewählt sind
        if (!selectedDate || !selectedStylist) {
            return;
        }
        
        // Lade-Indikator anzeigen
        timeSlotsContainer.innerHTML = '<div class="loading">Lade verfügbare Termine...</div>';
        
        // API-Anfrage für verfügbare Zeitslots
        fetch(`${API_BASE_URL}/api/available-slots?date=${selectedDate}&stylistId=${selectedStylist}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Netzwerkantwort war nicht in Ordnung');
                }
                return response.json();
            })
            .then(data => {
                // Zeitslots rendern
                renderTimeSlots(data.availableSlots);
            })
            .catch(error => {
                console.error('Fehler beim Laden der verfügbaren Zeitslots:', error);
                timeSlotsContainer.innerHTML = '<div class="error">Fehler beim Laden der verfügbaren Termine. Bitte versuchen Sie es später erneut.</div>';
                
                // In der Entwicklungsumgebung Demo-Daten anzeigen
                if (process.env.NODE_ENV === 'development') {
                    renderDemoTimeSlots();
                }
            });
    }
    // Lade-Indikator anzeigen
    timeSlotsContainer.innerHTML = '<div class="loading"><div class="loading-spinner"></div>Lade verfügbare Termine...</div>';
    
    // Funktion zum Rendern der Zeitslots
    function renderTimeSlots(slots) {
        timeSlotsContainer.innerHTML = '';
        
        if (slots.length === 0) {
            timeSlotsContainer.innerHTML = '<div class="no-slots">Keine Termine verfügbar für diesen Tag.</div>';
            return;
        }
        
        slots.forEach(slot => {
            const timeSlot = document.createElement('div');
            timeSlot.className = `time-slot${slot.available ? '' : ' unavailable'}`;
            
            // Formatierte Uhrzeit (HH:MM)
            const formattedHour = String(slot.hour).padStart(2, '0');
            const formattedMinute = String(slot.minute).padStart(2, '0');
            timeSlot.textContent = `${formattedHour}:${formattedMinute}`;
            
            // Event Listener nur für verfügbare Slots
            if (slot.available) {
                timeSlot.addEventListener('click', function() {
                    // Alle Slots deselektieren
                    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                    
                    // Ausgewählten Slot markieren
                    this.classList.add('selected');
                });
            }
            
            timeSlotsContainer.appendChild(timeSlot);
        });
    }
    
    // Demo-Zeitslots für die Entwicklung
    function renderDemoTimeSlots() {
        const demoSlots = [];
        
        // Geschäftszeiten (9:00 - 18:00)
        for (let hour = 9; hour < 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                // Zufällig einige Slots als nicht verfügbar markieren
                const available = Math.random() > 0.3;
                
                demoSlots.push({
                    hour: hour,
                    minute: minute,
                    available: available
                });
            }
        }
        
        renderTimeSlots(demoSlots);
    }
    
    // Kalenderauswahl aktualisieren
    function updateCalendarSelection(dateString) {
        const selectedDate = new Date(dateString);
        const day = selectedDate.getDate();
        
        // Alle Tage deselektieren
        calendarDays.forEach(d => d.classList.remove('selected'));
        
        // Entsprechenden Tag im Kalender suchen und markieren
        calendarDays.forEach(dayElement => {
            if (dayElement.textContent == day && !dayElement.classList.contains('unavailable')) {
                dayElement.classList.add('selected');
            }
        });
    }
    
    // Event Listener für das Buchungsformular
    bookButton.addEventListener('click', function() {
        // Ausgewählten Service und Stylisten ermitteln
        const selectedServiceOption = serviceSelect.options[serviceSelect.selectedIndex];
        const selectedService = selectedServiceOption.value;
        const selectedServiceName = selectedServiceOption.text;
        
        const selectedStylistOption = staffSelect.options[staffSelect.selectedIndex];
        const selectedStylist = selectedStylistOption.value;
        const selectedStylistName = selectedStylistOption.text;
        
        // Ausgewähltes Datum und Uhrzeit ermitteln
        const selectedDate = datePicker.value;
        
        let selectedTime = '';
        document.querySelectorAll('.time-slot').forEach(slot => {
            if (slot.classList.contains('selected')) {
                selectedTime = slot.textContent;
            }
        });
        
        // Kundendaten erfassen
        const clientName = document.getElementById('clientName').value;
        const clientEmail = document.getElementById('clientEmail').value;
        const clientPhone = document.getElementById('clientPhone').value;
        const clientNotes = document.getElementById('clientNotes').value;
        
        // Validierung der Eingaben
        if (!validateForm(clientName, clientEmail, clientPhone, selectedService, selectedStylist, selectedDate, selectedTime)) {
            return;
        }
        
        // Loading-Status anzeigen
        bookButton.disabled = true;
        bookButton.textContent = 'Termin wird gebucht...';
        
        // API-Anfrage zum Buchen des Termins
        fetch(`${API_BASE_URL}/api/book-appointment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                service: selectedService,
                stylistId: selectedStylist,
                date: selectedDate,
                time: selectedTime,
                clientName: clientName,
                clientEmail: clientEmail,
                clientPhone: clientPhone,
                notes: clientNotes
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Netzwerkantwort war nicht in Ordnung');
            }
            return response.json();
        })
        .then(data => {
            // Bestätigungsdetails ausfüllen
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const selectedDateObj = new Date(selectedDate);
            
            confirmDate.textContent = selectedDateObj.toLocaleDateString('de-DE', options);
            confirmTime.textContent = selectedTime + ' Uhr';
            confirmService.textContent = selectedServiceName;
            confirmStylist.textContent = selectedStylistName;
            
            // Buchungssystem ausblenden und Bestätigung anzeigen
            bookingSystem.style.display = 'none';
            confirmation.style.display = 'block';
            
            // Button zurücksetzen
            bookButton.disabled = false;
            bookButton.textContent = 'Termin buchen';
        })
        .catch(error => {
            console.error('Fehler beim Buchen des Termins:', error);
            alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
            
            // Button zurücksetzen
            bookButton.disabled = false;
            bookButton.textContent = 'Termin buchen';
            
            // In der Entwicklungsumgebung trotzdem Bestätigung anzeigen
            if (process.env.NODE_ENV === 'development') {
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const selectedDateObj = new Date(selectedDate);
                
                confirmDate.textContent = selectedDateObj.toLocaleDateString('de-DE', options);
                confirmTime.textContent = selectedTime + ' Uhr';
                confirmService.textContent = selectedServiceName;
                confirmStylist.textContent = selectedStylistName;
                
                bookingSystem.style.display = 'none';
                confirmation.style.display = 'block';
            }
        });
    });
    
    // Funktion zur Formularvalidierung
    function validateForm(name, email, phone, service, stylist, date, time) {
        // Überprüfen, ob alle erforderlichen Felder ausgefüllt sind
        if (!name || !email || !phone || !service || !stylist || !date || !time) {
            alert('Bitte füllen Sie alle erforderlichen Felder aus.');
            return false;
        }
        
        // E-Mail-Validierung
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
            return false;
        }
        
        // Telefonnummer-Validierung (einfache Version)
        const phoneRegex = /^[0-9\s\/\(\)\+\-]{6,20}$/;
        if (!phoneRegex.test(phone)) {
            alert('Bitte geben Sie eine gültige Telefonnummer ein.');
            return false;
        }
        
        return true;
    }
    
    // Neuen Termin buchen
    newBookingBtn.addEventListener('click', function() {
        // Formular zurücksetzen
        document.getElementById('clientName').value = '';
        document.getElementById('clientEmail').value = '';
        document.getElementById('clientPhone').value = '';
        document.getElementById('clientNotes').value = '';
        serviceSelect.selectedIndex = 0;
        staffSelect.selectedIndex = 0;
        
        // Deselektieren
        document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
        calendarDays.forEach(day => day.classList.remove('selected'));
        
        // Bestätigung ausblenden und Buchungssystem anzeigen
        confirmation.style.display = 'none';
        bookingSystem.style.display = 'flex';
    });
    
    // Kalenderpfeile
    const prevMonthBtn = document.querySelector('.prev-month');
    const nextMonthBtn = document.querySelector('.next-month');
    const monthNav = document.querySelector('.month-nav');
    
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    let currentMonthIndex = today.getMonth();
    let currentYear = today.getFullYear();
    
    // Aktuellen Monat anzeigen
    monthNav.textContent = `${months[currentMonthIndex]} ${currentYear}`;
    
    // In einer vollständigen Implementierung würden diese Handler den Kalender 
    // tatsächlich aktualisieren und neue Daten vom Server laden
    prevMonthBtn.addEventListener('click', function() {
        if (currentMonthIndex > 0 || currentYear > today.getFullYear()) {
            currentMonthIndex--;
            if (currentMonthIndex < 0) {
                currentMonthIndex = 11;
                currentYear--;
            }
            monthNav.textContent = `${months[currentMonthIndex]} ${currentYear}`;
            loadCalendarMonth(currentYear, currentMonthIndex + 1);
        }
    });
    
    nextMonthBtn.addEventListener('click', function() {
        currentMonthIndex++;
        if (currentMonthIndex > 11) {
            currentMonthIndex = 0;
            currentYear++;
        }
        monthNav.textContent = `${months[currentMonthIndex]} ${currentYear}`;
        loadCalendarMonth(currentYear, currentMonthIndex + 1);
    });
    
    // Funktion zum Laden der Kalenderansicht für einen bestimmten Monat
    function loadCalendarMonth(year, month) {
        // In einer vollständigen Implementierung würde hier eine API-Anfrage gesendet werden,
        // um die verfügbaren Tage für den angegebenen Monat zu laden
        
        // Beispielimplementierung:
        fetch(`${API_BASE_URL}/api/available-days?year=${year}&month=${month}&stylistId=${staffSelect.value}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Netzwerkantwort war nicht in Ordnung');
                }
                return response.json();
            })
            .then(data => {
                renderCalendarMonth(year, month, data.availableDays);
            })
            .catch(error => {
                console.error('Fehler beim Laden der Kalenderdaten:', error);
                
                // In der Entwicklungsumgebung Demo-Daten anzeigen
                if (process.env.NODE_ENV === 'development') {
                    renderDemoCalendarMonth(year, month);
                }
            });
    }
    
    // Demo-Funktion zum Rendern eines Kalendermonats
    function renderDemoCalendarMonth(year, month) {
        // Diese Funktion würde in einer vollständigen Implementierung
        // den Kalender mit den Tagen des angegebenen Monats füllen
        console.log(`Demo-Kalender für ${months[month-1]} ${year} wird gerendert`);
    }
    
    // Initial die verfügbaren Zeitslots laden, sobald der Stylist ausgewählt wird
    staffSelect.addEventListener('change', loadAvailableTimeSlots);
});