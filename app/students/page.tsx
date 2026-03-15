import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudentsScreen(
    students: List<Student>,
    isLoaded: Boolean,
    onBackClick: () -> Unit,
    onUpdateStudent: (Student) -> Unit,
    onDeleteStudent: (String) -> Unit,
    onWhatsAppClick: (Student) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var filter by remember { mutableStateOf("All") }

    var editingStudent by remember { mutableStateOf<Student?>(null) }
    var deletingStudent by remember { mutableStateOf<Student?>(null) }

    val filterOptions = listOf("All", "Paid", "Pending", "Overdue")

    val filteredStudents = remember(students, searchQuery, filter) {
        students.filter { s ->
            val matchesSearch = s.name.contains(searchQuery, ignoreCase = true) || 
                                s.phone.contains(searchQuery)
            val matchesFilter = filter == "All" || s.paymentStatus.name.equals(filter, ignoreCase = true)
            matchesSearch && matchesFilter
        }.sortedBy { it.name }
    }

    if (!isLoaded) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Color(0xFF4F46E5))
        }
        return
    }

    Scaffold(
        containerColor = Color(0xFFF8FAFC)
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // Header Section
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFF1F5F9))
                    .clickable(onClick = onBackClick),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color(0xFF64748B))
            }

            Text("Student Roster", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search name or phone...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Color(0xFF94A3B8)) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White,
                    focusedBorderColor = Color(0xFF4F46E5),
                    unfocusedBorderColor = Color.Transparent
                )
            )

            // Filter Tabs
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(filterOptions) { opt ->
                    val isSelected = filter == opt
                    Surface(
                        shape = CircleShape,
                        color = if (isSelected) Color(0xFF4F46E5) else Color.White,
                        shadowElevation = if (isSelected) 4.dp else 1.dp,
                        modifier = Modifier.clickable { filter = opt }
                    ) {
                        Text(
                            text = opt.uppercase(),
                            color = if (isSelected) Color.White else Color(0xFF94A3B8),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                            letterSpacing = 1.sp
                        )
                    }
                }
            }

            // Student List
            if (filteredStudents.isEmpty()) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 48.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(Icons.Default.Group, contentDescription = null, tint = Color(0xFFCBD5E1), modifier = Modifier.size(48.dp))
                    Spacer(Modifier.height(16.dp))
                    Text("No students found matching your criteria.", color = Color(0xFF94A3B8), fontWeight = FontWeight.Medium)
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(filteredStudents, key = { it.id }) { student ->
                        StudentRosterCard(
                            student = student,
                            onWhatsAppClick = { onWhatsAppClick(student) },
                            onEditClick = { editingStudent = student },
                            onDeleteClick = { deletingStudent = student }
                        )
                    }
                    item { Spacer(modifier = Modifier.height(80.dp)) }
                }
            }
        }
    }

    // Modals
    editingStudent?.let { student ->
        EditStudentDialog(
            student = student,
            onDismiss = { editingStudent = null },
            onSave = { updatedStudent ->
                onUpdateStudent(updatedStudent)
                editingStudent = null
            }
        )
    }

    deletingStudent?.let { student ->
        AlertDialog(
            onDismissRequest = { deletingStudent = null },
            containerColor = Color.White,
            icon = {
                Box(modifier = Modifier.size(48.dp).background(Color(0xFFFFF1F2), CircleShape), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Delete, contentDescription = null, tint = Color(0xFFE11D48))
                }
            },
            title = { Text("Remove Student?", fontWeight = FontWeight.Bold) },
            text = { Text("Are you sure you want to remove ${student.name}? This action cannot be undone.") },
            confirmButton = {
                Button(
                    onClick = {
                        onDeleteStudent(student.id)
                        deletingStudent = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE11D48))
                ) {
                    Text("Remove")
                }
            },
            dismissButton = {
                TextButton(onClick = { deletingStudent = null }) {
                    Text("Cancel", color = Color(0xFF64748B))
                }
            }
        )
    }
}

@Composable
fun StudentRosterCard(
    student: Student,
    onWhatsAppClick: () -> Unit,
    onEditClick: () -> Unit,
    onDeleteClick: () -> Unit
) {
    var menuExpanded by remember { mutableStateOf(false) }
    val sdf = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
    val formattedDate = sdf.format(Date(student.expiryDate))

    val statusColor = when (student.paymentStatus) {
        PaymentStatus.Paid -> Color(0xFF059669) // Emerald
        PaymentStatus.Overdue -> Color(0xFFE11D48) // Rose
        PaymentStatus.Pending -> Color(0xFFD97706) // Amber
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.dp, Color(0xFFF1F5F9), RoundedCornerShape(16.dp))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                // Avatar
                Box(
                    modifier = Modifier.size(48.dp).background(Color(0xFFEEF2FF), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(student.name.take(1).uppercase(), color = Color(0xFF4F46E5), fontSize = 18.sp, fontWeight = FontWeight.Bold)
                }
                Column {
                    Text(student.name, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Icon(Icons.Default.Phone, contentDescription = null, tint = Color(0xFF94A3B8), modifier = Modifier.size(12.dp))
                        Text(student.phone, fontSize = 12.sp, color = Color(0xFF64748B))
                    }
                }
            }
            Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                // Status Tag
                Surface(color = statusColor.copy(alpha = 0.1f), shape = RoundedCornerShape(4.dp)) {
                    Text(
                        text = student.paymentStatus.name.uppercase(),
                        color = statusColor,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                    )
                }
                Text("DESK ${student.deskNumber} • ${student.shift.name.uppercase()}", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF94A3B8))
            }
        }

        HorizontalDivider(color = Color(0xFFF8FAFC))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column {
                Text("FEES DUE DATE", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF94A3B8), letterSpacing = 1.sp)
                Text(formattedDate, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF334155))
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                IconButton(
                    onClick = onWhatsAppClick,
                    modifier = Modifier.size(36.dp).background(Color(0xFFECFDF5), CircleShape)
                ) {
                    Icon(Icons.Default.Chat, contentDescription = "WhatsApp", tint = Color(0xFF059669), modifier = Modifier.size(20.dp))
                }
                
                // Native Dropdown Menu implementation
                Box {
                    IconButton(
                        onClick = { menuExpanded = true },
                        modifier = Modifier.size(36.dp).background(if (menuExpanded) Color(0xFFEEF2FF) else Color(0xFFF8FAFC), CircleShape)
                    ) {
                        Icon(Icons.Default.MoreVert, contentDescription = "More Options", tint = if (menuExpanded) Color(0xFF4F46E5) else Color(0xFF94A3B8))
                    }
                    
                    DropdownMenu(
                        expanded = menuExpanded,
                        onDismissRequest = { menuExpanded = false },
                        modifier = Modifier.background(Color.White)
                    ) {
                        DropdownMenuItem(
                            text = { Text("Edit Profile", color = Color(0xFF4F46E5)) },
                            leadingIcon = { Icon(Icons.Default.Edit, contentDescription = null, tint = Color(0xFF4F46E5)) },
                            onClick = {
                                menuExpanded = false
                                onEditClick()
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Remove", color = Color(0xFFE11D48)) },
                            leadingIcon = { Icon(Icons.Default.Delete, contentDescription = null, tint = Color(0xFFE11D48)) },
                            onClick = {
                                menuExpanded = false
                                onDeleteClick()
                            }
                        )
                    }
                }
            }
        }
    }
}

// Scoped state for the Edit Form
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditStudentDialog(student: Student, onDismiss: () -> Unit, onSave: (Student) -> Unit) {
    var name by remember { mutableStateOf(student.name) }
    var phone by remember { mutableStateOf(student.phone) }
    var deskNumber by remember { mutableStateOf(student.deskNumber.toString()) }
    var shift by remember { mutableStateOf(student.shift) }

    var shiftDropdownExpanded by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White, RoundedCornerShape(24.dp))
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Edit Student", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                IconButton(onClick = onDismiss) { Icon(Icons.Default.Close, contentDescription = "Close") }
            }

            OutlinedTextField(
                value = name, onValueChange = { name = it },
                label = { Text("Full Name") }, leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)
            )
            OutlinedTextField(
                value = phone, onValueChange = { phone = it },
                label = { Text("Phone Number") }, leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)
            )
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = deskNumber, onValueChange = { deskNumber = it },
                    label = { Text("Desk No.") }, leadingIcon = { Icon(Icons.Default.EventSeat, contentDescription = null) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp)
                )
                
                // Shift Dropdown mapping
                Box(modifier = Modifier.weight(1f)) {
                    OutlinedTextField(
                        value = shift.displayName, onValueChange = {}, readOnly = true,
                        label = { Text("Shift") }, leadingIcon = { Icon(Icons.Default.Schedule, contentDescription = null) },
                        modifier = Modifier.fillMaxWidth().clickable { shiftDropdownExpanded = true }, shape = RoundedCornerShape(12.dp),
                        enabled = false, // Disables text entry but allows the box below to catch clicks
                        colors = OutlinedTextFieldDefaults.colors(disabledTextColor = Color.Black, disabledBorderColor = Color.Gray, disabledLabelColor = Color.Gray, disabledLeadingIconColor = Color.Gray)
                    )
                    Box(modifier = Modifier.matchParentSize().clickable { shiftDropdownExpanded = true }) // Click catcher
                    DropdownMenu(expanded = shiftDropdownExpanded, onDismissRequest = { shiftDropdownExpanded = false }) {
                        ShiftType.values().forEach { st ->
                            DropdownMenuItem(
                                text = { Text(st.displayName) },
                                onClick = { shift = st; shiftDropdownExpanded = false }
                            )
                        }
                    }
                }
            }

            Button(
                onClick = { onSave(student.copy(name = name, phone = phone, deskNumber = deskNumber, shift = shift)) },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Icon(Icons.Default.CheckCircle, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("SAVE CHANGES", fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
            }
        }
    }
}
