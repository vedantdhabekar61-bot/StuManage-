package com.desktracker.app.ui.screens

import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.navigation.NavController
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddStudentScreen(navController: NavController, onAddStudent: suspend (StudentData) -> Unit) {
    val context = LocalContext.LocalContext
    val coroutineScope = rememberCoroutineScope()
    val scrollState = rememberScrollState()

    // State matching React's useState
    var isSubmitting by remember { mutableStateOf(false) }
    var showSuccess by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var deskNumber by remember { mutableStateOf("") }
    var shift by remember { mutableStateOf("Morning") }
    var price by remember { mutableStateOf("") }
    
    var duration by remember { mutableStateOf("1") }
    var durationUnit by remember { mutableStateOf("Month") }
    
    val dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE
    var startDate by remember { mutableStateOf(LocalDate.now().format(dateFormatter)) }
    var expiryDate by remember { mutableStateOf(LocalDate.now().plusMonths(1).format(dateFormatter)) }
    
    var paymentMethod by remember { mutableStateOf("UPI") }

    // Helper to calculate expiry
    fun updateExpiry(start: String, dur: String, unit: String) {
        try {
            val date = LocalDate.parse(start, dateFormatter)
            val d = dur.toLongOrNull() ?: 0L
            val exp = if (unit == "Month") date.plusMonths(d) else date.plusYears(d)
            expiryDate = exp.format(dateFormatter)
        } catch (e: Exception) {
            // Handle invalid date parse
        }
    }

    Scaffold(
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { navController.popBackStack() },
                    modifier = Modifier
                        .background(Color(0xFFF1F5F9), CircleShape)
                        .size(40.dp)
                ) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color(0xFF64748B))
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text("Add New Student", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                    Text("Register a new student and assign a desk.", fontSize = 14.sp, color = Color(0xFF64748B))
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
                .verticalScroll(scrollState),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            
            // Error Message
            AnimatedVisibility(visible = error != null) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFFFF1F2), RoundedCornerShape(16.dp))
                        .border(1.dp, Color(0xFFFFE4E6), RoundedCornerShape(16.dp))
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Warning, contentDescription = "Error", tint = Color(0xFFE11D48))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(error ?: "", color = Color(0xFFE11D48), fontSize = 14.sp, fontWeight = FontWeight.Medium)
                }
            }

            // Student Details Section
            SectionHeader("Student Details")
            CustomTextField(value = name, onValueChange = { name = it; error = null }, placeholder = "Full Name", icon = Icons.Default.Person)
            CustomTextField(value = phone, onValueChange = { phone = it; error = null }, placeholder = "Phone Number", icon = Icons.Default.Phone, keyboardType = KeyboardType.Phone)

            // Desk & Shift Section
            SectionHeader("Desk & Shift")
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                CustomTextField(
                    value = deskNumber, 
                    onValueChange = { deskNumber = it; error = null }, 
                    placeholder = "Desk No.", 
                    icon = Icons.Default.EventSeat, 
                    keyboardType = KeyboardType.Number,
                    modifier = Modifier.weight(1f)
                )
                // Simplified dropdown mapping for Compose
                CustomTextField(
                    value = shift, 
                    onValueChange = {}, 
                    placeholder = "Shift", 
                    icon = Icons.Default.Schedule,
                    modifier = Modifier.weight(1f),
                    readOnly = true
                    // In a full implementation, attach an ExposedDropdownMenuBox here
                )
            }

            // Plan & Billing Section
            SectionHeader("Plan & Billing")
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("Amount (₹)", fontSize = 12.sp, color = Color(0xFF64748B), fontWeight = FontWeight.Medium, modifier = Modifier.padding(bottom = 8.dp))
                    CustomTextField(value = price, onValueChange = { price = it; error = null }, placeholder = "0.00", icon = Icons.Default.AttachMoney, keyboardType = KeyboardType.Number)
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text("Duration", fontSize = 12.sp, color = Color(0xFF64748B), fontWeight = FontWeight.Medium, modifier = Modifier.padding(bottom = 8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        CustomTextField(value = duration, onValueChange = { duration = it; updateExpiry(startDate, it, durationUnit) }, placeholder = "1", keyboardType = KeyboardType.Number, modifier = Modifier.weight(0.4f))
                        CustomTextField(value = durationUnit, onValueChange = {}, placeholder = "Month", readOnly = true, modifier = Modifier.weight(0.6f))
                    }
                }
            }

            // Dates
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("Start Date", fontSize = 12.sp, color = Color(0xFF64748B), fontWeight = FontWeight.Medium, modifier = Modifier.padding(bottom = 8.dp))
                    CustomTextField(value = startDate, onValueChange = { startDate = it; updateExpiry(it, duration, durationUnit) }, placeholder = "YYYY-MM-DD", icon = Icons.Default.DateRange)
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text("Fees Due Date", fontSize = 12.sp, color = Color(0xFF64748B), fontWeight = FontWeight.Medium, modifier = Modifier.padding(bottom = 8.dp))
                    CustomTextField(value = expiryDate, onValueChange = {}, placeholder = "YYYY-MM-DD", icon = Icons.Default.DateRange, readOnly = true, enabled = false)
                }
            }

            // Payment Method
            Text("Payment Method", fontSize = 12.sp, color = Color(0xFF64748B), fontWeight = FontWeight.Medium)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("UPI", "Cash").forEach { method ->
                    val isSelected = paymentMethod == method
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(16.dp))
                            .background(if (isSelected) Color(0xFFEEF2FF) else Color.White)
                            .border(1.dp, if (isSelected) Color(0xFF4F46E5) else Color(0xFFF1F5F9), RoundedCornerShape(16.dp))
                            .clickable { paymentMethod = method; error = null }
                            .padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(method, color = if (isSelected) Color(0xFF4F46E5) else Color(0xFF64748B), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Submit Button
            Button(
                onClick = {
                    if (name.isBlank() || phone.isBlank() || deskNumber.isBlank()) {
                        error = "Please fill all required fields"
                        return@Button
                    }
                    coroutineScope.launch {
                        isSubmitting = true
                        error = null
                        try {
                            onAddStudent(StudentData(name, phone, deskNumber.toInt(), shift, price.toDoubleOrNull() ?: 0.0, startDate, expiryDate, paymentMethod))
                            delay(800) // Simulate network
                            isSubmitting = false
                            showSuccess = true
                            delay(1500)
                            navController.navigate("students_list") { popUpTo("students_list") { inclusive = true } }
                        } catch (e: Exception) {
                            error = e.message ?: "Failed to register student."
                            isSubmitting = false
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .padding(vertical = 16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5)),
                enabled = !isSubmitting
            ) {
                if (isSubmitting) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                } else {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("REGISTER STUDENT", fontSize = 14.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                }
            }
        }

        // Success Overlay Dialog
        if (showSuccess) {
            Dialog(onDismissRequest = { }) {
                Card(
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    modifier = Modifier.padding(16.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .background(Color(0xFFD1FAE5), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = "Success", tint = Color(0xFF059669), modifier = Modifier.size(32.dp))
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("Registration Successful!", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                        Text("Redirecting to student list...", fontSize = 14.sp, color = Color(0xFF64748B))
                    }
                }
            }
        }
    }
}

@Composable
fun SectionHeader(title: String) {
    Text(
        text = title.uppercase(),
        fontSize = 12.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.sp,
        color = Color(0xFF94A3B8)
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomTextField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    modifier: Modifier = Modifier,
    icon: androidx.compose.ui.graphics.vector.ImageVector? = null,
    keyboardType: KeyboardType = KeyboardType.Text,
    readOnly: Boolean = false,
    enabled: Boolean = true
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        placeholder = { Text(placeholder, color = Color(0xFF94A3B8), fontSize = 14.sp) },
        leadingIcon = icon?.let { { Icon(it, contentDescription = null, tint = Color(0xFF94A3B8), modifier = Modifier.size(20.dp)) } },
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(keyboardType = keyboardType),
        readOnly = readOnly,
        enabled = enabled,
        colors = OutlinedTextFieldDefaults.colors(
            unfocusedContainerColor = if (enabled) Color.White else Color(0xFFF8FAFC),
            focusedContainerColor = Color.White,
            unfocusedBorderColor = Color(0xFFF1F5F9),
            focusedBorderColor = Color(0xFF4F46E5)
        ),
        singleLine = true
    )
}

// Data class mapping
data class StudentData(
    val name: String,
    val phone: String,
    val deskNumber: Int,
    val shift: String,
    val price: Double,
    val startDate: String,
    val expiryDate: String,
    val paymentMethod: String
)
