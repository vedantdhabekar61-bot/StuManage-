import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// Replicating your types
enum class ShiftType(val displayName: String) {
    Morning("Morning"), Evening("Evening"), FullDay("Full Day")
}

data class DeskData(
    val number: Int,
    val status: String, // "Booked" or "Available"
    val studentName: String?,
    val shift: ShiftType?
)

@OptIn(ExperimentalAnimationApi::class)
@Composable
fun SeatsScreen(
    initialTotalSeats: Int,
    students: List<Student>, // Reusing the Student data class from the previous screen
    onBackClick: () -> Unit,
    onSaveCapacity: (Int) -> Unit
) {
    var activeShift by remember { mutableStateOf(ShiftType.Morning) }
    var isEditing by remember { mutableStateOf(false) }
    var tempSeats by remember { mutableStateOf(initialTotalSeats.toString()) }
    var currentTotalSeats by remember { mutableStateOf(initialTotalSeats) }

    // Replicating your Array.from logic
    val desks = remember(currentTotalSeats, students, activeShift) {
        List(currentTotalSeats) { index ->
            val deskNumber = index + 1
            // In your React code, you checked string equality. Here we match enums.
            val student = students.find { 
                it.deskNumber.toIntOrNull() == deskNumber && 
                (it.shift == activeShift || it.shift == ShiftType.FullDay) 
            }
            
            DeskData(
                number = deskNumber,
                status = if (student != null) "Booked" else "Available",
                studentName = student?.name,
                shift = student?.shift
            )
        }
    }

    val handleSaveSeats = {
        val newCapacity = tempSeats.toIntOrNull() ?: currentTotalSeats
        currentTotalSeats = newCapacity
        onSaveCapacity(newCapacity)
        isEditing = false
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC)) // slate-50
    ) {
        // Header Section
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Back Button
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

            // Title and Legend/Settings
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Seat Layout", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = {
                            isEditing = !isEditing
                            tempSeats = currentTotalSeats.toString()
                        },
                        colors = IconButtonDefaults.iconButtonColors(
                            containerColor = if (isEditing) Color(0xFFE0E7FF) else Color(0xFFF8FAFC),
                            contentColor = if (isEditing) Color(0xFF4F46E5) else Color(0xFF94A3B8)
                        )
                    ) {
                        Icon(Icons.Default.Settings, contentDescription = "Edit Capacity")
                    }
                    
                    // Legend
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        LegendItem("FREE", Color(0xFF10B981))
                        LegendItem("BOOKED", Color(0xFFF43F5E))
                    }
                }
            }

            // Edit Capacity Panel (Animated)
            AnimatedVisibility(
                visible = isEditing,
                enter = fadeIn() + slideInVertically(initialOffsetY = { -it / 2 }),
                exit = fadeOut() + slideOutVertically(targetOffsetY = { -it / 2 })
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFEEF2FF), RoundedCornerShape(16.dp))
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text("TOTAL CAPACITY", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF818CF8), letterSpacing = 1.sp)
                        OutlinedTextField(
                            value = tempSeats,
                            onValueChange = { tempSeats = it },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.width(80.dp).height(48.dp),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = Color.White,
                                unfocusedContainerColor = Color.White,
                                focusedBorderColor = Color(0xFF4F46E5),
                                unfocusedBorderColor = Color(0xFFE0E7FF)
                            )
                        )
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        IconButton(
                            onClick = handleSaveSeats,
                            colors = IconButtonDefaults.iconButtonColors(containerColor = Color(0xFF4F46E5), contentColor = Color.White)
                        ) {
                            Icon(Icons.Default.Check, contentDescription = "Save", modifier = Modifier.size(16.dp))
                        }
                        IconButton(
                            onClick = { isEditing = false },
                            colors = IconButtonDefaults.iconButtonColors(containerColor = Color.White, contentColor = Color(0xFF94A3B8))
                        ) {
                            Icon(Icons.Default.Close, contentDescription = "Cancel", modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }

            // Shift Selector (Segmented Control)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFFF1F5F9), RoundedCornerShape(16.dp))
                    .padding(4.dp)
            ) {
                ShiftType.values().forEach { shift ->
                    val isSelected = activeShift == shift
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (isSelected) Color.White else Color.Transparent)
                            .clickable { activeShift = shift }
                            .padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = shift.displayName.uppercase(),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isSelected) Color(0xFF4F46E5) else Color(0xFF64748B),
                            letterSpacing = 1.sp
                        )
                    }
                }
            }
        }

        // Desk Grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(4),
            contentPadding = PaddingValues(start = 24.dp, end = 24.dp, bottom = 24.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(desks, key = { it.number }) { desk ->
                DeskCard(desk = desk)
            }
            
            // Info Footer
            item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(4) }) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 16.dp, bottom = 80.dp)
                        .background(Color(0xFFEEF2FF), RoundedCornerShape(16.dp))
                        .padding(16.dp)
                ) {
                    Text(
                        text = "Showing availability for ${activeShift.displayName} shift. Desks marked in red are occupied by students in this shift or full-day students.",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF4338CA)
                    )
                }
            }
        }
    }
}

@Composable
fun LegendItem(text: String, color: Color) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        Box(modifier = Modifier.size(8.dp).background(color, CircleShape))
        Text(text, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF94A3B8), letterSpacing = 1.sp)
    }
}

// Native implementation of your <Desk /> component
@Composable
fun DeskCard(desk: DeskData) {
    val isBooked = desk.status == "Booked"
    val bgColor = if (isBooked) Color(0xFFFFF1F2) else Color.White
    val borderColor = if (isBooked) Color(0xFFFECDD3) else Color(0xFFF1F5F9)
    val numberColor = if (isBooked) Color(0xFFE11D48) else Color(0xFF94A3B8)

    Column(
        modifier = Modifier
            .aspectRatio(1f)
            .background(bgColor, RoundedCornerShape(16.dp))
            .border(1.dp, borderColor, RoundedCornerShape(16.dp))
            .padding(8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = desk.number.toString(),
            fontSize = 20.sp,
            fontWeight = FontWeight.Black,
            color = numberColor
        )
        if (isBooked && desk.studentName != null) {
            Spacer(Modifier.height(4.dp))
            Text(
                text = desk.studentName.split(" ").firstOrNull() ?: "", // Just show first name
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFBE123C),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                textAlign = TextAlign.Center
            )
        }
    }
}
