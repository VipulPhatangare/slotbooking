





document.addEventListener('DOMContentLoaded',async function() {

    

    

    
    const bookedSlots = {
    '09-06-2025': {
        '10:00': 0,
        '11:00': 0,
        '12:00': 0,
        '1:00': 0,
        '2:00': 0,
        '3:00': 0,
        '4:00': 0,
        '5:00': 0,
        '6:00': 0,
        '7:00': 0
    },
    '10-06-2025': {
        '10:00': 0,
        '11:00': 0,
        '12:00': 0,
        '1:00': 0,
        '2:00': 0,
        '3:00': 0,
        '4:00': 0,
        '5:00': 0,
        '6:00': 0,
        '7:00': 0
    },
    '11-06-2025': {
        '10:00': 0,
        '11:00': 0,
        '12:00': 0,
        '1:00': 0,
        '2:00': 0,
        '3:00': 0,
        '4:00': 0,
        '5:00': 0,
        '6:00': 0,
        '7:00': 0
    }
    };


    async function bookslotfetch() {
    const response = await fetch('/bookslotfetch');
    const data = await response.json();

    data.forEach(element => {
        const date = element.date;
        if (bookedSlots[date]) {
        for (const time in bookedSlots[date]) {
            if (element[time] !== undefined) {
            bookedSlots[date][time] = parseInt(element[time]);
            }
        }
        }
    });

    // console.log(bookedSlots);

    }

    await bookslotfetch();
    
    const timeSlots = [];
    const times = ['10','11','12','1','2','3','4','5','6','7'];
    times.forEach(element => {
        const time = `${element.toString()}:00`;
        timeSlots.push(time);
    });
    
    let selectedDay = '09-06-2025';
    let selectedSlot = null;
    let userData = {};
    generateSlots(selectedDay);
    // Alert functions
    function showAlert(message, type = 'error') {
        const alert = document.getElementById('alert');
        const alertMessage = document.getElementById('alertMessage');
        
        alert.className = `alert ${type}`;
        alert.style.display = 'flex';
        alertMessage.textContent = message;
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            alert.style.display = 'none';
        }, 10000);
    }

    document.getElementById('closeAlert').addEventListener('click', function() {
        document.getElementById('alert').style.display = 'none';
    });

    // Phone validation
    function validatePhone(phone) {
        const regex = /^[0-9]{10}$/;
        return regex.test(phone);
    }

    let phoneNumber;
    // Form submission handler
    document.getElementById('registrationForm').addEventListener('submit',async function(e) {
        e.preventDefault();
        
        const phone = document.getElementById('phone').value;
        
        // Validate phone number
        if (!validatePhone(phone)) {
            showAlert('Please enter a valid 10-digit phone number');
            return;
        }
        
        // Collect user data
        userData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            phone: phone,
            email: document.getElementById('email').value
        };
        phoneNumber = phone;
        try {

            const response = await fetch('/send_data', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if(!data.flag){
                showAlert(data.msg);
                return;
            }else{
                document.getElementById('registrationSection').style.display = 'none';
                document.getElementById('slotSection').style.display = 'block';
                
                generateSlots(selectedDay);
                
                document.getElementById('slotSection').scrollIntoView({ behavior: 'smooth' });
            
            }
        } catch (error) {
            console.log(error);
        }
        
        
    });

    // Day tab click event
    document.querySelectorAll('.day-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            selectedDay = this.getAttribute('data-day');
            selectedSlot = null;
            document.getElementById('confirmBtn').style.display = 'none';
            generateSlots(selectedDay);
        });
    });

    // Slot selection
    document.getElementById('slotsContainer').addEventListener('click', function(e) {
        if (e.target.classList.contains('slot') && !e.target.classList.contains('full')) {
            document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
            e.target.classList.add('selected');
            selectedSlot = e.target.getAttribute('data-time');
            document.getElementById('confirmBtn').style.display = 'block';
        }
    });

    // Confirm booking
    document.getElementById('confirmBtn').addEventListener('click', async function() {
        if (!selectedDay || !selectedSlot) return;
        try {

            let a = bookedSlots[selectedDay][selectedSlot] + 1;
            const slotData = {
                phone : phoneNumber,
                date : selectedDay,
                slot : selectedSlot,
                slotchangedata : a
            }

            const response = await fetch('/bookslot', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(slotData)
            });

            const data = await response.json();
            // console.log(data);

            if(data.flag){
                const bookingDetails = `
                    <p><strong>Name:</strong> ${userData.firstName} ${userData.lastName}</p>
                    <p><strong>Phone:</strong> ${userData.phone}</p>
                    <p><strong>Email:</strong> ${userData.email}</p>
                    <p><strong>Date:</strong> ${formatDate(selectedDay)}</p>
                    <p><strong>Time:</strong> ${selectedSlot}</p>
                `;
                
                document.getElementById('bookingDetails').innerHTML = bookingDetails;
                document.getElementById('slotSection').style.display = 'none';
                document.getElementById('confirmation').style.display = 'block';
                document.getElementById('confirmation').scrollIntoView({ behavior: 'smooth' });
                
            }
        } catch (error) {
            console.log(error);
        }
        
        
    });

    // Function to generate slots for a given day
    function generateSlots(day) {
        const container = document.getElementById('slotsContainer');
        container.innerHTML = '';
        
        timeSlots.forEach(time => {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.setAttribute('data-time', time);
            slot.textContent = time;
            
            // Check if slot is booked
            const dayBookings = bookedSlots[day] || {};
            // console.log(dayBookings);
            time = `${time}`;
            // console.log(time);
            const bookedCount = dayBookings[time];
            // console.log(bookedCount);
            if (bookedCount >= 10) {
                slot.classList.add('full');
            }
            
            container.appendChild(slot);
        });
    }

    // Helper function to format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
});