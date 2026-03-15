import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.CurrencyRupee
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.text.SimpleDateFormat
import java.util.*

// Enums and Data Classes mimicking your web types
enum class FilterType { All, Overdue, Paid }
enum class PaymentStatus { Paid, Overdue, Pending }

data class Student(
    val id: String,
    val name: String,
    val phone: String,
    val deskNumber: String,
    val price: Double,
    val expiryDate: Long, // Stored as epoch millis for easy native handling
    val paymentStatus: PaymentStatus
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RemindersScreen(
    students: List<Student>,
    onBackClick: () -> Unit,
    onBulkSendClick: () -> Unit,
    onWhatsAppClick: (Student) -> Unit
) {
    var activeFilter by remember { mutableStateOf(FilterType.All) }
    var searchQuery by remember { mutableStateOf("") }
    
    // Derived State (useMemo equivalent)
    val filteredStudents = remember(students, searchQuery, activeFilter) {
        students.filter { student ->
            val matchesSearch = student.name.contains(searchQuery, ignoreCase = true) ||
                                student.phone.contains(searchQuery)
            
            when (activeFilter) {
                FilterType.Overdue -> matchesSearch && student.paymentStatus == PaymentStatus.Overdue
                FilterType.Paid -> matchesSearch && student.paymentStatus == PaymentStatus.Paid
                FilterType.All -> matchesSearch
            }
        }
    }

    val stats = remember(students) {
        val today = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }.timeInMillis

        val overdueCount = students.count { it.expiryDate < today && it.paymentStatus != PaymentStatus.Paid }
        val paidCount = students.count { it.paymentStatus == PaymentStatus.Paid }
        val totalPending = students
            .filter { it.paymentStatus != PaymentStatus.Paid || it.expiryDate < today }
            .sumOf { it.price }

        Triple(overdueCount, paidCount, totalPending)
    }

    Scaffold(
        containerColor = Color(0xFFF8FAFC), // slate-50 equivalent
        topBar = {
            TopAppBar(
                title = { Text("Fee Reminders", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    Button(
                        onClick = onBulkSendClick,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.padding(end = 16.dp)
                    ) {
                        Icon(Icons.AutoMirrored.Filled.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("BULK SEND", fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 24.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            item { Spacer(modifier = Modifier.height(8.dp)) }

            // Summary Cards
            item {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatCard(
                        modifier = Modifier.weight(1f),
                        count = stats.first.toString(),
                        label = "OVERDUE",
                        countColor = Color(0xFFE11D48),
                        borderColor = Color(0xFFFFF1F2)
                    )
                    StatCard(
                        modifier = Modifier.weight(1f),
                        count = stats.second.toString(),
                        label = "PAID",
                        countColor = Color(0xFF059669),
                        borderColor = Color(0xFFECFDF5)
                    )
                }
            }

            // Pending Amount Banner
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xFF4F46E5))
                        .padding(20.dp)
                ) {
                    // Blur effect circle (simulating your web blur-xl)
                    Box(
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .offset(x = 16.dp, y = (-16).dp)
                            .size(96.dp)
                            .blur(24.dp)
                            .background(Color.White.copy(alpha = 0.1f), CircleShape)
                    )
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("TOTAL PENDING FEES", color = Color(0xFFE0E7FF), fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                            Text("₹${"%,.0f".format(stats.third)}", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Black)
                        }
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color.White.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.CurrencyRupee, contentDescription = null, tint = Color.White)
                        }
                    }
                }
            }

            // Search Bar
            item {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search student or phone...") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White,
                        focusedBorderColor = Color(0xFF4F46E5),
                        unfocusedBorderColor = Color.Transparent
                    )
                )
            }

            // Filter Chips
            item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(FilterType.values()) { filter ->
                        val isSelected = activeFilter == filter
                        Surface(
                            shape = CircleShape,
                            color = if (isSelected) Color(0xFF4F46E5) else Color.White,
                            shadowElevation = if (isSelected) 4.dp else 1.dp,
                            modifier = Modifier.clickable { activeFilter = filter }
                        ) {
                            Text(
                                text = filter.name,
                                color = if (isSelected) Color.White else Color(0xFF64748B),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp)
                            )
                        }
                    }
                }
            }

            // Student List
            if (filteredStudents.isEmpty()) {
                item {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 48.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(Icons.Default.Notifications, contentDescription = null, tint = Color(0xFFCBD5E1), modifier = Modifier.size(48.dp))
                        Spacer(Modifier.height(16.dp))
                        Text("No students found for this filter.", color = Color(0xFF94A3B8), fontWeight = FontWeight.Medium)
                    }
                }
            } else {
                items(filteredStudents, key = { it.id }) { student ->
                    StudentCard(student = student, onWhatsAppClick = { onWhatsAppClick(student) })
                }
            }
            
            item { Spacer(modifier = Modifier.height(80.dp)) } // Bottom padding
        }
    }
}

@Composable
fun StatCard(modifier: Modifier = Modifier, count: String, label: String, countColor: Color, borderColor: Color) {
    Column(
        modifier = modifier
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.dp, borderColor, RoundedCornerShape(16.dp))
            .padding(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(count, fontSize = 24.sp, fontWeight = FontWeight.Black, color = countColor)
        Text(label, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = countColor.copy(alpha = 0.7f), letterSpacing = 1.sp)
    }
}

@Composable
fun StudentCard(student: Student, onWhatsAppClick: () -> Unit) {
    // Formatting date
    val sdf = SimpleDateFormat("dd MMMM", Locale.getDefault())
    val formattedDate = sdf.format(Date(student.expiryDate))

    val statusColor = when (student.paymentStatus) {
        PaymentStatus.Paid -> Color(0xFF059669)
        PaymentStatus.Overdue -> Color(0xFFE11D48)
        PaymentStatus.Pending -> Color(0xFFD97706)
    }
    val statusBg = statusColor.copy(alpha = 0.1f)

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 12.dp)
            .background(Color.White, RoundedCornerShape(24.dp))
            .border(1.dp, Color(0xFFF1F5F9), RoundedCornerShape(24.dp))
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Box(
                    modifier = Modifier.size(48.dp).background(Color(0xFFF8FAFC), RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Person, contentDescription = null, tint = Color(0xFF94A3B8))
                }
                Column {
                    Text(student.name, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                    Text("DESK ${student.deskNumber} • ${student.phone}", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF94A3B8), letterSpacing = 1.sp)
                }
            }
            Surface(color = statusBg, shape = CircleShape) {
                Text(
                    text = student.paymentStatus.name.uppercase(),
                    color = statusColor,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                )
            }
        }

        Divider(color = Color(0xFFF8FAFC))

        // Details
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Column {
                Text("DUE DATE", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF94A3B8), letterSpacing = 1.sp)
                Text(formattedDate, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF334155))
            }
            Column(horizontalAlignment = Alignment.End) {
                Text("FEE AMOUNT", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF94A3B8), letterSpacing = 1.sp)
                Text("₹${student.price.toInt()}", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Color(0xFF4F46E5))
            }
        }

        // Action Button
        if (student.paymentStatus != PaymentStatus.Paid) {
            Button(
                onClick = onWhatsAppClick,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth().height(56.dp)
            ) {
                Text("SEND WHATSAPP REMINDER", fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
            }
        }
    }
}
