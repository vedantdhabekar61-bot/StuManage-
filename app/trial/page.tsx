import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class Benefit(
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val iconColor: Color
)

@Composable
fun TrialScreen(
    onStartTrialSuccess: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var isStarting by remember { mutableStateOf(false) }

    val benefits = listOf(
        Benefit("Track Student Fees", "फीस का हिसाब रखें", Icons.Default.Bolt, Color(0xFFF59E0B)),
        Benefit("Manual Fee Reminders", "व्हाट्सएप पर रिमाइंडर भेजें", Icons.Default.Notifications, Color(0xFF6366F1)),
        Benefit("Attendance Management", "हाजिरी लगाना हुआ आसान", Icons.Default.Group, Color(0xFF10B981)),
        Benefit("Simple Monthly Reports", "महीने की पूरी रिपोर्ट देखें", Icons.Default.BarChart, Color(0xFFF43F5E))
    )

    Box(modifier = Modifier.fillMaxSize().background(Color(0xFFF8FAFC))) {
        
        // Main Scrollable Content
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 140.dp) // Room for sticky bottom button
        ) {
            // 1. Top Banner
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(256.dp)
                        .background(Color(0xFF4F46E5)),
                    contentAlignment = Alignment.Center
                ) {
                    // Decorative abstract circles
                    Box(modifier = Modifier.fillMaxSize().alpha(0.1f)) {
                        Box(modifier = Modifier.size(256.dp).offset(x = (-128).dp, y = (-128).dp).background(Color.White, CircleShape))
                        Box(modifier = Modifier.align(Alignment.BottomEnd).size(384.dp).offset(x = 128.dp, y = 128.dp).background(Color.White, CircleShape))
                    }

                    // Header Content
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(
                            modifier = Modifier
                                .size(80.dp)
                                .background(Color.White.copy(alpha = 0.2f), RoundedCornerShape(24.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Shield, contentDescription = null, tint = Color.White, modifier = Modifier.size(48.dp))
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("DeskTracker Pro", fontSize = 28.sp, fontWeight = FontWeight.Black, color = Color.White, letterSpacing = (-0.5).sp)
                        Text("Smart Student Management", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = Color(0xFFE0E7FF), modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }

            // 2. Overlapping Content Area
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .offset(y = (-32).dp)
                        .clip(RoundedCornerShape(topStart = 40.dp, topEnd = 40.dp))
                        .background(Color(0xFFF8FAFC))
                        .padding(horizontal = 24.dp, vertical = 40.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Heading Section
                    Text("Start Your 1 Month Free Trial", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A), textAlign = TextAlign.Center)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Manage students, track fees and send reminders easily.", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = Color(0xFF64748B), textAlign = TextAlign.Center)
                    Text("विद्यार्थियों और फीस का प्रबंधन अब और भी आसान।", fontSize = 12.sp, color = Color(0xFF94A3B8), textAlign = TextAlign.Center, modifier = Modifier.padding(top = 4.dp))

                    Spacer(modifier = Modifier.height(32.dp))

                    // Pricing Highlight Card
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFEEF2FF), RoundedCornerShape(32.dp))
                            .border(1.dp, Color(0xFFE0E7FF), RoundedCornerShape(32.dp))
                            .padding(24.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("PRICING", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF818CF8), letterSpacing = 2.sp)
                            Row(verticalAlignment = Alignment.Baseline, modifier = Modifier.padding(vertical = 4.dp)) {
                                Text("₹50", fontSize = 24.sp, fontWeight = FontWeight.Black, color = Color(0xFF4F46E5))
                                Text(" / month", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF818CF8))
                            }
                            Text("AFTER 30 DAYS TRIAL", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA5B4FC))
                        }
                        
                        Box(modifier = Modifier.width(1.dp).height(48.dp).background(Color(0xFFE0E7FF)))

                        Column(horizontalAlignment = Alignment.End) {
                            Surface(color = Color(0xFFECFDF5), border = BorderStroke(1.dp, Color(0xFFD1FAE5)), shape = CircleShape) {
                                Text("1st Month FREE", color = Color(0xFF059669), fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp))
                            }
                            Text("Cancel anytime", fontSize = 10.sp, color = Color(0xFF94A3B8), modifier = Modifier.padding(top = 8.dp))
                        }
                    }

                    Spacer(modifier = Modifier.height(32.dp))

                    // Benefits List Header
                    Text("KEY BENEFITS", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF94A3B8), letterSpacing = 2.sp, modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, bottom = 16.dp))
                }
            }

            // 3. Benefits Items
            itemsIndexed(benefits) { _, benefit ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 6.dp)
                        .background(Color.White, RoundedCornerShape(16.dp))
                        .border(1.dp, Color(0xFFF1F5F9), RoundedCornerShape(16.dp))
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(modifier = Modifier.size(40.dp).background(Color(0xFFF8FAFC), RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) {
                        Icon(benefit.icon, contentDescription = null, tint = benefit.iconColor, modifier = Modifier.size(20.dp))
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(benefit.title, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                        Text(benefit.subtitle, fontSize = 10.sp, fontWeight = FontWeight.Medium, color = Color(0xFF94A3B8), letterSpacing = (-0.5).sp)
                    }
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF10B981), modifier = Modifier.size(20.dp))
                }
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(top = 24.dp),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Lock, contentDescription = null, tint = Color(0xFF94A3B8), modifier = Modifier.size(12.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("CANCEL ANYTIME. NO HIDDEN CHARGES.", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF94A3B8), letterSpacing = 2.sp)
                }
            }
        }

        // Sticky Bottom Button with Gradient Fade
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .background(Brush.verticalGradient(colors = listOf(Color.Transparent, Color(0xFFF8FAFC), Color(0xFFF8FAFC))))
                .padding(24.dp)
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Button(
                    onClick = {
                        isStarting = true
                        coroutineScope.launch {
                            delay(800) // Simulating network call
                            onStartTrialSuccess()
                        }
                    },
                    enabled = !isStarting,
                    modifier = Modifier.fillMaxWidth().height(56.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    if (isStarting) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                    } else {
                        Text("START FREE TRIAL", fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, contentDescription = null, modifier = Modifier.size(16.dp))
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
                Text("1000+ Teachers already using DeskTracker", fontSize = 10.sp, fontWeight = FontWeight.Medium, color = Color(0xFF94A3B8))
            }
        }
    }
}
